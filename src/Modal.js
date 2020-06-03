import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './Modal.module.scss';

function disableScrolling() {
  document.body.style.overflow = 'hidden';
}

function enableScrolling() {
  document.body.style.overflow = '';
}

export default function ({ children, onClose }) {
  const [mounted, setMounted] = useState(false);

  const el = useMemo(() => {
    const div = document.createElement('div');
    div.className = styles.modal;
    return div;
  }, []);

  useEffect(() => {
    document.getElementById('modal-root').appendChild(el);
    setMounted(true);
    return () => {
      setMounted(false);
      document.getElementById('modal-root').removeChild(el);
    };
  }, [el]);

  useEffect(() => {
    disableScrolling();
    return enableScrolling;
  });

  // Wait until the component is mounted to render.
  // This allows things like autofocus to work in child components
  // (which require being mounted at render time)
  if (!mounted) return null;

  const modalEl = (
    <React.Fragment>
      <div className={styles.modalBackground} onClick={onClose} />
      <div className={styles.modalContent}>{children}</div>
    </React.Fragment>
  );

  return ReactDOM.createPortal(modalEl, el);
}
