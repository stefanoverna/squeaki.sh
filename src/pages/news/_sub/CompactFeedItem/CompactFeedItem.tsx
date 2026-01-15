import { format } from 'date-fns';
import styles from './CompactFeedItem.module.css';
import type { FeedItem } from '../utils';

function formatDateCompact(date: string) {
  try {
    const d = new Date(date);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday ? format(d, 'p') : format(d, 'P');
  } catch {
    return '???';
  }
}

export function CompactFeedItem({
  item,
  onMarkRead,
}: {
  item: FeedItem;
  onMarkRead?: (id: string) => void;
}) {
  const handleClick = () => {
    onMarkRead?.(item.id);
  };

  return (
    <a
      className={styles.compactItem}
      href={item.url}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
    >
      <span className={styles.compactContent}>
        <span className={styles.compactTitle}>{item.title}</span>
        {item.description && (
          <span className={styles.compactDescription}> — {item.description}</span>
        )}
      </span>
      {onMarkRead ? (
        <button
          type="button"
          className={styles.markRead}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onMarkRead(item.id);
          }}
        >
          <time dateTime={item.date}>{formatDateCompact(item.date)}</time>
        </button>
      ) : (
        <time dateTime={item.date}>{formatDateCompact(item.date)}</time>
      )}
    </a>
  );
}
