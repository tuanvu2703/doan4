import { useRef } from 'react';

export default function useDebounce(callback, delay) {
    const timeoutRef = useRef(null);

    return (...args) => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    };
}
