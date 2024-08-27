import React, { useState, useRef, useEffect, useCallback } from 'react';

const styles = {
  card: {
    position: 'absolute',
    borderRadius: '20px',
    backgroundColor: '#fff',
    border: '2px solid rgb(157 157 157)', // Light border that blends with the background
    boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'grab',
    userSelect: 'none',
  },
  cardContent: {
    position: 'relative',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1,
  },
  cardHeader: {
    padding: '15px',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
  },
  cardMain: {
    flex: 1,
    padding: '20px',
    overflow: 'auto',
  },
  cardFooter: {
    padding: '15px',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
  },
  cardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  greenOverlay: {
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
  },
  redOverlay: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
  },
};

const SwipeableCard = ({ content, onSwipe, onCardLeftScreen, onSwipeable, style, width = 300, height }) => {
  const SWIPE_THRESHOLD = 0.4;
  const ASPECT_RATIO = 10 / 7;
  const calculatedHeight = height || Math.round(width * ASPECT_RATIO);

  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [transform, setTransform] = useState({ x: 0, y: 0, rotate: 0 });
  const [overlayOpacity, setOverlayOpacity] = useState({ green: 0, red: 0 });

  const cardRef = useRef(null);
  const startPositionRef = useRef({ x: 0, y: 0 });
  const currentOffsetRef = useRef({ x: 0, y: 0 });
  const isSwipeableRef = useRef(false);
  const animationFrameRef = useRef(null);

  const updateCardPosition = useCallback((deltaX, deltaY) => {
    const cardWidth = cardRef.current.offsetWidth;

    currentOffsetRef.current = { x: deltaX, y: 0 }; // Ignore vertical movement

    // Calculate overlay opacities
    const horizontalOpacity = Math.min(Math.abs(deltaX) / (cardWidth * SWIPE_THRESHOLD), 1);

    setOverlayOpacity({
      green: deltaX > 0 ? horizontalOpacity : 0,
      red: deltaX < 0 ? horizontalOpacity : 0,
    });

    setTransform({
      x: deltaX,
      y: 0, // Ignore vertical movement
      rotate: deltaX * 0.1,
    });

    let direction = null;
    if (Math.abs(deltaX) > cardWidth * SWIPE_THRESHOLD) {
      direction = deltaX > 0 ? 'right' : 'left';
    }

    if (direction && !isSwipeableRef.current) {
      isSwipeableRef.current = true;
      onSwipeable(direction);
    } else if (!direction && isSwipeableRef.current) {
      isSwipeableRef.current = false;
      onSwipeable(null);
    }
  }, [SWIPE_THRESHOLD, onSwipeable]);

  const handleStart = useCallback((clientX, clientY) => {
    setIsDragging(true);
    startPositionRef.current = { x: clientX, y: clientY };
    document.body.style.overflow = 'hidden';
  }, []);

  const handleMove = useCallback((clientX, clientY) => {
    if (!isDragging) return;

    const deltaX = clientX - startPositionRef.current.x;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      updateCardPosition(deltaX, 0); // Ignore vertical movement
    });
  }, [isDragging, updateCardPosition]);

  const handleEnd = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    document.body.style.overflow = '';
    setIsDragging(false);
    const cardWidth = cardRef.current.offsetWidth;

    if (Math.abs(currentOffsetRef.current.x) > cardWidth * SWIPE_THRESHOLD) {
      const direction = currentOffsetRef.current.x > 0 ? 'right' : 'left';
      onSwipe(direction, content);
      setTransform(prev => ({ ...prev, x: direction === 'right' ? cardWidth * 2 : -cardWidth * 2, rotate: direction === 'right' ? 30 : -30 }));
      setTimeout(() => {
        setIsVisible(false);
        onCardLeftScreen(content.key);
      }, 300);
    } else {
      setTransform({ x: 0, y: 0, rotate: 0 });
    }

    // Reset the overlay opacity and notify parent that swiping has ended
    setOverlayOpacity({ green: 0, red: 0 });
    onSwipeable(null);

    currentOffsetRef.current = { x: 0, y: 0 };
    isSwipeableRef.current = false;
  }, [onSwipe, onCardLeftScreen, onSwipeable, content.key, SWIPE_THRESHOLD]);

  useEffect(() => {
    const handleMouseMove = (e) => handleMove(e.clientX, e.clientY);
    const handleMouseUp = () => handleEnd();

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMove, handleEnd]);
  

  if (!isVisible) return null;

  return (
    <div
      ref={cardRef}
      style={{
        ...styles.card,
        ...style,
        width,
        height: calculatedHeight,
        transform: `translate(${transform.x}px, ${transform.y}px) rotate(${transform.rotate}deg) ` + (style.transform || ''),
        transition: isDragging ? 'none' : 'transform 0.3s ease',
        willChange: 'transform',
      }}
      onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={handleEnd}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
    >
      {/* Card content remains the same */}
      {content.posterImage && (
        <div 
          style={{
            ...styles.cardBackground,
            backgroundImage: `url(${content.posterImage})`,
          }}
        />
      )}
      <div style={styles.cardContent}>
        {content.header && (
          <div style={styles.cardHeader} dangerouslySetInnerHTML={{ __html: content.header }} />
        )}
        <div style={styles.cardMain}>
          <h3>{content.name}</h3>
          <p>{content.description}</p>
        </div>
        {content.footer && (
          <div style={styles.cardFooter} dangerouslySetInnerHTML={{ __html: content.footer }} />
        )}
      </div>
      <div style={{ ...styles.overlay, ...styles.greenOverlay, opacity: overlayOpacity.green }} />
      <div style={{ ...styles.overlay, ...styles.redOverlay, opacity: overlayOpacity.red }} />
    </div>
  );
};

export default React.memo(SwipeableCard);
