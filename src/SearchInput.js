import cn from 'classnames';
import React from 'react';
import styles from './SearchInput.module.scss';
import { ReactComponent as SearchIcon } from './images/search.svg';

export default function ({ className, ...proxiedProps }) {
  return (
    <label className={styles.wrapper}>
      <input className={cn(styles.input, className)} {...proxiedProps} />
      <SearchIcon className={styles.icon} />
    </label>
  );
}
