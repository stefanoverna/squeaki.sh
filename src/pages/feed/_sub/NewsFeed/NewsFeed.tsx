import { formatDistanceToNow } from 'date-fns';
import { keyBy } from 'lodash-es';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './NewsFeed.module.css';

const POLL_INTERVAL_MS = 10000;

import type { GroupedItem, Source } from '../utils';
import { FeedItemCard } from '../FeedItemCard/FeedItemCard';
import { CompactFeedItem } from '../CompactFeedItem/CompactFeedItem';

type ItemsResponse = {
  sources: Source[];
  groupedItems: GroupedItem[];
  erroredSources: Source[];
  generatedAt: string;
  pendingSourceCount: number;
};

export function NewsFeed() {
  const [data, setData] = useState<ItemsResponse | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const token =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('token') : null;

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    async function fetchItems(signal: AbortSignal): Promise<ItemsResponse> {
      const res = await fetch('./api/items.json', { signal });
      return res.json();
    }

    async function poll() {
      if (cancelled) return;
      try {
        const controller = new AbortController();
        abortRef.current = controller;
        const itemsData = await fetchItems(controller.signal);
        if (cancelled) return;
        setData(itemsData);

        if (itemsData.pendingSourceCount > 0) {
          setRefreshing(true);
          timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
        } else {
          setRefreshing(false);
        }
      } catch (e) {
        if (cancelled) return;
        // Don't overwrite error on poll failures after initial load
        if (!data) {
          setError(e instanceof Error ? e.message : 'Failed to load');
        }
        setRefreshing(false);
      }
    }

    async function initialFetch() {
      try {
        const controller = new AbortController();
        abortRef.current = controller;
        const itemsData = await fetchItems(controller.signal);
        if (cancelled) return;
        setData(itemsData);

        if (token) {
          const readRes = await fetch(`./api/read?token=${encodeURIComponent(token)}`, {
            signal: controller.signal,
          });
          if (readRes.ok) {
            const readItems: string[] = await readRes.json();
            if (!cancelled) setReadIds(new Set(readItems));
          }
        }

        if (window.location.hash === '#sources') {
          setTimeout(() => {
            document.getElementById('sources')?.scrollIntoView({ behavior: 'smooth' });
          }, 1000);
        }

        if (itemsData.pendingSourceCount > 0) {
          setRefreshing(true);
          timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    initialFetch();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      abortRef.current?.abort();
    };
  }, [token]);

  const markAsRead = useCallback(
    (id: string) => {
      if (!token) return;

      // Optimistically update UI
      setReadIds((prev) => new Set([...prev, id]));

      // Send to server (fire and forget)
      fetch(`./api/read?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      }).catch(console.error);
    },
    [token],
  );

  const markAllAsRead = useCallback(
    (ids: string[]) => {
      if (!token) return;

      // Optimistically update UI
      setReadIds((prev) => new Set([...prev, ...ids]));

      // Send to server (fire and forget)
      fetch(`./api/read?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      }).catch(console.error);
    },
    [token],
  );

  if (loading) {
    return <div className={styles.loading}>Refreshing the feed...</div>;
  }

  if (error || !data) {
    return <div className={styles.error}>Error: {error || 'No data'}</div>;
  }

  const sourcesById = keyBy(data.sources, 'id');

  // Filter out read items and compute effective main/additional for each group
  const processedGroups = (
    token
      ? data.groupedItems
          .map((group) => ({
            main: readIds.has(group.main.id) ? null : group.main,
            additional: group.additional.filter((item) => !readIds.has(item.id)),
          }))
          .filter((group) => group.main !== null || group.additional.length > 0)
      : data.groupedItems
  )
    .map((group) => {
      // If main was filtered out but we have additional items, promote the first one
      const mainItem = group.main || group.additional[0];
      const additionalItems = group.main ? group.additional : group.additional.slice(1);
      return { mainItem, additionalItems };
    })
    .filter((group) => group.mainItem !== undefined);

  // Re-sort groups by the date of their effective main item
  const sortedGroups = [...processedGroups].sort(
    (a, b) => new Date(b.mainItem!.date).getTime() - new Date(a.mainItem!.date).getTime(),
  );

  return (
    <>
      <div className={styles.pre}>
        updated {formatDistanceToNow(new Date(data.generatedAt), { addSuffix: true })}
        {refreshing && <span className={styles.spinner} />}
      </div>

      {sortedGroups.map(({ mainItem, additionalItems }) => {
        if (!mainItem) return null;

        const source = sourcesById[mainItem.sourceId];
        if (!source) return null;

        return (
          <div className={styles.feedGroup} key={mainItem.id}>
            <FeedItemCard
              item={mainItem}
              source={source}
              additionalItemIds={additionalItems.map((i) => i.id)}
              onMarkRead={token ? markAsRead : undefined}
              onMarkAllRead={token ? markAllAsRead : undefined}
            />
            {additionalItems.length > 0 && (
              <div className={styles.additionalItems}>
                {additionalItems.map((item) => (
                  <CompactFeedItem
                    key={item.id}
                    item={item}
                    onMarkRead={token ? markAsRead : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {data.erroredSources.length > 0 && (
        <div className={styles.post}>
          Errored sources:{' '}
          <ul>
            {data.erroredSources.map((source) => (
              <li key={source.id}>
                <a href={source.websiteUrl}>{source.title}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
