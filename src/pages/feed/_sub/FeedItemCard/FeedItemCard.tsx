import { differenceInDays, format, formatRelative } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { upperFirst } from 'lodash-es';
import styles from './FeedItemCard.module.css';
import type { FeedItem, Source } from '../utils';

const formatRelativeLocale: Record<string, string> = {
  lastWeek: "'Last' eeee",
  yesterday: "'Yesterday'",
  today: "'Today'",
  tomorrow: "'Tomorrow'",
  nextWeek: 'eeee',
  other: 'MMM do',
};

function formatDate(date: string) {
  try {
    return differenceInDays(new Date(), date) > 6
      ? format(date, 'MMM do')
      : upperFirst(
          formatRelative(date, new Date(), {
            locale: { ...enUS, formatRelative: (token) => formatRelativeLocale[token] },
          }),
        );
  } catch {
    return '???';
  }
}

export function FeedItemCard({
  item,
  source,
  additionalItemIds = [],
  onMarkRead,
  onMarkAllRead,
}: {
  item: FeedItem;
  source: Source;
  additionalItemIds?: string[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: (ids: string[]) => void;
}) {
  const faviconUrl = `https://s2.googleusercontent.com/s2/favicons?${new URLSearchParams({
    domain: source.websiteUrl,
    sz: '16',
  }).toString()}`;

  const handleClick = () => {
    onMarkRead?.(item.id);
  };

  return (
    <a
      className={styles.feedItem}
      href={item.url}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
    >
      <div className={styles.overlay} style={{ backgroundImage: `url(${faviconUrl})` }} />
      <div className={styles.inner}>
        <header className={styles.header}>
          <img src={faviconUrl} alt="favicon" width="16" />
          {source.title}
        </header>
        <h3 className={styles.title}>{item.title}</h3>
        {item.description && (
          <div
            className={styles.description}
            dangerouslySetInnerHTML={{ __html: item.description }}
          />
        )}
        {item.image && <img className={styles.feedImage} src={item.image} alt="" />}
        <div className={styles.meta}>
          <time dateTime={item.date}>{formatDate(item.date)}</time>
          {onMarkRead && (
            <span className={styles.actions}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onMarkRead(item.id);
                }}
              >
                Mark read
              </button>
              {onMarkAllRead && additionalItemIds.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onMarkAllRead([item.id, ...additionalItemIds]);
                  }}
                >
                  Mark all read
                </button>
              )}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
