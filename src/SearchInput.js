import cn from 'classnames';
import React from 'react';
import styles from './SearchInput.module.scss';
import { ReactComponent as SearchIcon } from './images/search.svg';

const DEBOUNCE_MS = 500;

export default function ({ className, searchRequest, ...proxiedProps }) {
  const [debounceTimer, setDebounceTimeout] = React.useState(null);

  const onChange = React.useCallback(
    e => {
      const searchTerm = e.target.value;
      clearTimeout(debounceTimer);
      const timer = setTimeout(() => searchRequest(searchTerm), DEBOUNCE_MS);
      setDebounceTimeout(timer);
    },
    [debounceTimer, searchRequest]
  );

  return (
    <label className={cn(styles.wrapper, className)}>
      <input className={styles.input} onChange={onChange} {...proxiedProps} />
      <SearchIcon className={styles.icon} />
    </label>
  );
}
