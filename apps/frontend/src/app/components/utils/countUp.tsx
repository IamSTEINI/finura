import React, { useState, useEffect, useRef } from 'react';

interface CountUpProps {
    target: number;
    duration: number;
    decimals?: number;
}

const CountUp: React.FC<CountUpProps> = ({ 
    target, 
    duration, 
    decimals = 0,
}) => {
    const [count, setCount] = useState(0);
    const startTimeRef = useRef<number | null>(null);
    const requestRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        startTimeRef.current = null;
        
        const animate = (timestamp: number) => {
            if (startTimeRef.current === null) {
                startTimeRef.current = timestamp;
            }
            
            const elapsed = timestamp - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);
            
            const easedProgress = progress * (2 - progress);
            setCount(easedProgress * target);
            
            if (progress < 1) {
                requestRef.current = requestAnimationFrame(animate);
            }
        };
        
        requestRef.current = requestAnimationFrame(animate);
        
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [target, duration]);

    return (
        <>
            {Number(count.toFixed(decimals))}
        </>
    );
};

export default CountUp;