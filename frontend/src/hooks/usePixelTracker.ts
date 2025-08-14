import { useEffect, useRef } from 'react';
import { pixelService } from '../services/api';
import { PixelEventParams } from '../services/Pixel';
import { trackMetaEvent, mapToMetaEvent } from '../utils/MetaPixel';

const usePixelTracker = (pixelId: string | null, active: boolean, metaPixelId?: string | null) => {
  const scrollDepth = useRef<number>(0);
  const mouseMoveTracker = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimer = useRef<NodeJS.Timeout | null>(null);
  const pageVisibilityRef = useRef(!document.hidden);

  const trackEvent = (params: PixelEventParams) => {
    if (!active || !pixelId || !params.eventType) return;

   if (!pageVisibilityRef.current && !params.eventType.includes('page_')) return;

    try {
      pixelService.trackEvent(pixelId, params);
      if (metaPixelId && params.eventType) {
        const metaEventName = mapToMetaEvent(params.eventType);
        trackMetaEvent(metaEventName, params.metadata);
      }
    } catch (error) {
      console.error('Error tracking pixel event:', error);
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      pageVisibilityRef.current = isVisible;

      if (active && pixelId) {
        trackEvent({
          eventType: isVisible ? 'page_visible' : 'page_hidden',
          metadata: {
            timestamp: Date.now(),
            visibility: isVisible ? 'visible' : 'hidden'
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [pixelId, active]);

  const trackScroll = () => {
    try {
      const scrollPosition = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

      // Éviter la division par zéro
      if (documentHeight <= 0) return;

      const scrollPercentage = Math.min(100, Math.max(0, Math.floor((scrollPosition / documentHeight) * 100)));

      // Envoyer l'événement seulement par paliers de 10% pour réduire le spam
      const currentMilestone = Math.floor(scrollPercentage / 10) * 10;
      const previousMilestone = Math.floor(scrollDepth.current / 10) * 10;

      if (currentMilestone > previousMilestone && scrollPercentage > scrollDepth.current) {
        scrollDepth.current = scrollPercentage;
        trackEvent({
          eventType: 'scroll',
          metadata: {
            depth: scrollPercentage,
            milestone: currentMilestone
          }
        });
      }
    } catch (error) {
      console.error('Error tracking scroll:', error);
    }
  };

  const trackMouseMove = (e: MouseEvent) => {
    try {
      if (mouseMoveTracker.current) clearTimeout(mouseMoveTracker.current);

      mouseMoveTracker.current = setTimeout(() => {
        // Vérifier que le pixel est toujours actif avant d'envoyer l'événement
        if (active && pixelId) {
          trackEvent({
            eventType: 'mouse_move',
            metadata: {
              x: Math.round(e.clientX),
              y: Math.round(e.clientY),
              viewport: {
                width: window.innerWidth,
                height: window.innerHeight
              }
            }
          });
        }
      }, 2000); // Augmenté à 2 secondes pour réduire le spam
    } catch (error) {
      console.error('Error tracking mouse move:', error);
    }
  };

  const startHeartbeat = () => {
    try {
      // Envoyer le premier heartbeat immédiatement
      trackEvent({
        eventType: 'heartbeat',
        metadata: {
          timestamp: Date.now(),
          url: window.location.href
        }
      });

      // Puis configurer l'intervalle
      heartbeatTimer.current = setInterval(() => {
        if (active && pixelId) {
          trackEvent({
            eventType: 'heartbeat',
            metadata: {
              timestamp: Date.now(),
              url: window.location.href
            }
          });
        }
      }, 30000);
    } catch (error) {
      console.error('Error starting heartbeat:', error);
    }
  };

  useEffect(() => {
    if (!active || !pixelId) {
      // Nettoyer si le pixel devient inactif
      if (heartbeatTimer.current) {
        clearInterval(heartbeatTimer.current);
        heartbeatTimer.current = null;
      }
      if (mouseMoveTracker.current) {
        clearTimeout(mouseMoveTracker.current);
        mouseMoveTracker.current = null;
      }
      return;
    }

    try {
      // Réinitialiser la profondeur de scroll
      scrollDepth.current = 0;

      // Tracking de la vue initiale avec métadonnées enrichies
      trackEvent({
        eventType: 'view',
        metadata: {
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          referrer: document.referrer || 'direct'
        }
      });

      // Démarrer le heartbeat
      startHeartbeat();

      // Configurer les écouteurs d'événements avec options passives pour les performances
      window.addEventListener('scroll', trackScroll, { passive: true });
      document.addEventListener('mousemove', trackMouseMove, { passive: true });

    } catch (error) {
      console.error('Error initializing pixel tracker:', error);
    }

    return () => {
      try {
        // Nettoyer les écouteurs d'événements
        window.removeEventListener('scroll', trackScroll);
        document.removeEventListener('mousemove', trackMouseMove);

        // Arrêter le heartbeat
        if (heartbeatTimer.current) {
          clearInterval(heartbeatTimer.current);
          heartbeatTimer.current = null;
        }

        // Annuler le timer de mouvement de souris
        if (mouseMoveTracker.current) {
          clearTimeout(mouseMoveTracker.current);
          mouseMoveTracker.current = null;
        }
      } catch (error) {
        console.error('Error cleaning up pixel tracker:', error);
      }
    };
  }, [active, pixelId]);

  return { trackEvent };
};

export default usePixelTracker;