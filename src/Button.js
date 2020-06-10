import cn from 'classnames';
import React from 'react';
import styles from './Button.module.scss';

export default function ({ children, className, ...proxiedProps }) {
  return (
    <button {...proxiedProps} className={cn(styles.button, className)}>
      {children}
    </button>
  );
}
