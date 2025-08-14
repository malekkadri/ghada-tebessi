import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { vcardService, blockService, projectService, limitService, pixelService } from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaLink,
  FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp,
  FaTelegram, FaPinterest, FaReddit,
  FaDiscord,
  FaTwitch,
  FaSnapchat,
  FaSpotify,
  FaTiktok,
  FaYoutube,
  FaInstagram,
  FaGithub,
  FaFacebookMessenger
} from 'react-icons/fa';
import { VCard, Block, BlockIconConfig } from './../../services/vcard';
import VCardHeader from './VCardHeader';
import ContactBlock from './../../cards/ContactBlock';
import FloatingButtons from './../../atoms/buttons/FloatingButtons';
import { motion, AnimatePresence } from "framer-motion";
import usePixelTracker from '../../hooks/usePixelTracker';
import { Pixel } from '../../services/Pixel';

interface TrackingEvent {
  eventType: 'click' | 'mousemove' | 'hover' | 'scroll' | 'focus' | 'blur';
  elementType?: string;
  elementId?: string;
  blockId?: string;
  coordinates?: {
    x: number;
    y: number;
    pageX: number;
    pageY: number;
    clientX: number;
    clientY: number;
  };
  timestamp: number;
  metadata?: any;
  sessionId?: string;
  userAgent?: string;
  viewport?: {
    width: number;
    height: number;
  };
}

const ViewVCard: React.FC = () => {
  const { url } = useParams<{ url: string }>();
  const [vcard, setVCard] = useState<VCard | null>(null);
  const [vcardPixel, setVcardPixel] = useState<Pixel | null>(null);
  const { trackEvent } = usePixelTracker(vcardPixel?.id || null, !!vcardPixel?.is_active);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [vcardActive, setVcardActive] = useState(false);
  const hoverStartTime = useRef<number | null>(null);
  const currentHoveredBlock = useRef<string | null>(null);

  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`);
  const [isTracking, setIsTracking] = useState(true);
  const lastMouseMoveTime = useRef<number>(0);
  const mouseMoveThrottle = 100; 
  const trackingBuffer = useRef<TrackingEvent[]>([]);
  const bufferFlushInterval = useRef<NodeJS.Timeout | null>(null);
  const [project, setProject] = useState<{
    id: string;
    name: string;
    description: string;
    color: string;
    status: 'active' | 'archived' | 'pending';
  } | null>(null);
  const [currentPlanLimit, setCurrentPlanLimit] = useState<number>(1);
  const blockIcons: Record<string, BlockIconConfig> = {
    'Phone': {
      icon: FaPhone,
      gradient: 'from-purple-500 to-purple-600',
      shadow: 'shadow-purple-500/20'
    },
    'Email': {
      icon: FaEnvelope,
      gradient: 'from-red-500 to-red-600',
      shadow: 'shadow-red-500/20'
    },
    'Address': {
      icon: FaMapMarkerAlt,
      gradient: 'from-green-500 to-green-600',
      shadow: 'shadow-green-500/20'
    },
    'Link': {
      icon: FaLink,
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/20'
    },
    'Facebook': {
      icon: FaFacebook,
      gradient: 'from-blue-600 to-blue-700',
      shadow: 'shadow-blue-600/20'
    },
    'Twitter': {
      icon: FaTwitter,
      gradient: 'from-blue-400 to-blue-500',
      shadow: 'shadow-blue-400/20'
    },
    'Instagram': {
      icon: FaInstagram,
      gradient: 'from-pink-500 via-red-500 to-yellow-500',
      shadow: 'shadow-pink-500/20'
    },
    'Youtube': {
      icon: FaYoutube,
      gradient: 'from-red-600 to-red-700',
      shadow: 'shadow-red-600/20'
    },
    'Whatsapp': {
      icon: FaWhatsapp,
      gradient: 'from-green-500 to-green-600',
      shadow: 'shadow-green-500/20'
    },
    'Tiktok': {
      icon: FaTiktok,
      gradient: 'from-gray-900 via-gray-800 to-gray-700',
      shadow: 'shadow-gray-900/20'
    },
    'Telegram': {
      icon: FaTelegram,
      gradient: 'from-blue-400 to-blue-500',
      shadow: 'shadow-blue-400/20'
    },
    'Spotify': {
      icon: FaSpotify,
      gradient: 'from-green-500 to-green-600',
      shadow: 'shadow-green-500/20'
    },
    'Pinterest': {
      icon: FaPinterest,
      gradient: 'from-red-600 to-red-700',
      shadow: 'shadow-red-600/20'
    },
    'Linkedin': {
      icon: FaLinkedin,
      gradient: 'from-blue-700 to-blue-800',
      shadow: 'shadow-blue-700/20'
    },
    'Snapchat': {
      icon: FaSnapchat,
      gradient: 'from-yellow-400 to-yellow-500',
      shadow: 'shadow-yellow-400/20'
    },
    'Twitch': {
      icon: FaTwitch,
      gradient: 'from-purple-600 to-purple-700',
      shadow: 'shadow-purple-600/20'
    },
    'Discord': {
      icon: FaDiscord,
      gradient: 'from-indigo-500 to-indigo-600',
      shadow: 'shadow-indigo-500/20'
    },
    'Reddit': {
      icon: FaReddit,
      gradient: 'from-orange-500 to-orange-600',
      shadow: 'shadow-orange-500/20'
    },
    'GitHub': {
      icon: FaGithub,
      gradient: 'from-gray-700 to-gray-800',
      shadow: 'shadow-gray-700/20'
    },
    'Messenger': {
      icon: FaFacebookMessenger,
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/20'
    },
    'default': {
      icon: FaLink,
      gradient: 'from-gray-500 to-gray-600',
      shadow: 'shadow-gray-500/20'
    }
  };

  useEffect(() => {
    const fetchPlanLimits = async () => {
      try {
        const projectLimit = await limitService.checkProjectLimit();
        setCurrentPlanLimit(projectLimit.max === -1 ? Infinity : projectLimit.max);
      } catch (error) {
        console.error('Error fetching plan limits:', error);
      }
    };
    fetchPlanLimits();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const vcardData = await vcardService.getByUrl(url || '');
        setVCard(vcardData);

        if (vcardData.id) {
          try {
            const response = await pixelService.getUserPixels(vcardData.userId);

            let pixels: Pixel[] = [];
            if (Array.isArray(response)) {
              pixels = response;
            } else if (response && Array.isArray(response.data)) {
              pixels = response.data;
            } else if (response && Array.isArray(response.pixels)) {
              pixels = response.pixels;
            } else {
              console.warn('Unexpected pixel response format:', response);
              pixels = [];
            }

            const activePixel = pixels.find((p: Pixel) => p.is_active) || null;
            setVcardPixel(activePixel);

            if (activePixel && activePixel.metaPixelId) {
              try {
                const { initMetaPixel } = await import('../../utils/MetaPixel');
                initMetaPixel(activePixel.metaPixelId);
                console.log('Meta Pixel initialized:', activePixel.metaPixelId);
              } catch (metaError) {
                console.error('Error initializing Meta Pixel:', metaError);
              }
            }
          } catch (error) {
            console.error("Error loading pixel:", error);
            setVcardPixel(null);
          }
          
          if (vcardData.projectId) {
            try {
              const projectData = await projectService.getProjectById(vcardData.projectId);

              if (projectData.status === 'active') {
                try {
                  const allProjects = await projectService.getUserProjects(projectData.userId);
                  const sortedProjects = allProjects.sort((a: any, b: any) =>
                    new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime()
                  );

                  const projectIndex = sortedProjects.findIndex((p: any) => p.id === projectData.id);

                  const isWithinPlanLimit = currentPlanLimit === Infinity || projectIndex < currentPlanLimit;

                  if (isWithinPlanLimit) {
                    setProject({
                      id: projectData.id,
                      name: projectData.name,
                      description: projectData.description,
                      color: projectData.color,
                      status: projectData.status
                    });
                  }
                } catch (limitError) {
                  console.error("Error checking project limits:", limitError);
                  setProject({
                    id: projectData.id,
                    name: projectData.name,
                    description: projectData.description,
                    color: projectData.color,
                    status: projectData.status
                  });
                }
              }
            } catch (error) {
              console.error("Error loading project:", error);
            }
          }
          
          await vcardService.registerView(vcardData.id);
          const blocksData = await blockService.getByVcardId(vcardData.id);
          setBlocks(blocksData.data);
        }
      } catch (error:any) {
        if (error.response?.data?.isNotActive) {
          setVcardActive(true);
        } else {
          toast.error("Error loading data");
        }
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, currentPlanLimit]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [url]);

  useEffect(() => {
    if (vcard?.favicon) {
      const existingLinks = document.querySelectorAll("link[rel~='icon']");
      existingLinks.forEach(link => {
        document.head.removeChild(link);
      });

      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/x-icon';
      link.href = vcard.favicon;
      document.head.appendChild(link);
    }
  }, [vcard]);

  useEffect(() => {
    return () => {
      hoverStartTime.current = null;
      currentHoveredBlock.current = null;
    };
  }, []);

  const currentUrl = window.location.href;
  const pageTitle = vcard?.name || 'Digital Business Card';
  const pageDescription = vcard?.description || 'Connect with me using my digital business card';
  const pageImage = vcard?.logo || `${window.location.origin}/default-og-image.jpg`;

  const getBackgroundStyle = () => {
    if (!vcard) return {};

    switch (vcard.background_type) {
      case 'color':
        return { backgroundColor: vcard.background_value };
      case 'custom-image':
        return {
          backgroundImage: `url(${vcard.background_value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      case 'gradient':
      case 'gradient-preset':
        return {
          background: vcard.background_value,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      default:
        return { backgroundColor: '#f8fafc' };
    }
  };

  const createTrackingEvent = useCallback((
    eventType: TrackingEvent['eventType'],
    event?: MouseEvent | Event,
    additionalData?: Partial<TrackingEvent>
  ): TrackingEvent => {
    const mouseEvent = event as MouseEvent;
    const coordinates = mouseEvent ? {
      x: mouseEvent.offsetX || 0,
      y: mouseEvent.offsetY || 0,
      pageX: mouseEvent.pageX || 0,
      pageY: mouseEvent.pageY || 0,
      clientX: mouseEvent.clientX || 0,
      clientY: mouseEvent.clientY || 0,
    } : undefined;

    return {
      eventType,
      coordinates,
      timestamp: Date.now(),
      sessionId,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      ...additionalData,
    };
  }, [sessionId]);

  const sendTrackingEvent = useCallback(async (event: TrackingEvent) => {
    if (!vcardPixel?.is_active || !isTracking) return;

    try {
      if (vcardPixel?.id) {
        const eventData = {
          eventType: event.eventType,
          blockId: event.blockId,
          metadata: {
            ...event.metadata,
            coordinates: event.coordinates,
            sessionId: event.sessionId,
            userAgent: event.userAgent,
            viewport: event.viewport,
            timestamp: event.timestamp,
            elementType: event.elementType,
            elementId: event.elementId,
          }
        };

        await pixelService.trackEvent(vcardPixel.id, eventData);
      }

      trackEvent({
        eventType: event.eventType,
        blockId: event.blockId,
        metadata: {
          ...event.metadata,
          coordinates: event.coordinates,
          sessionId: event.sessionId,
          userAgent: event.userAgent,
          viewport: event.viewport,
          timestamp: event.timestamp,
          elementType: event.elementType,
          elementId: event.elementId,
        }
      });
    } catch (error) {
      console.error('Error sending tracking event:', error);
    }
  }, [vcardPixel?.is_active, vcardPixel?.id, isTracking, trackEvent]);

  const flushTrackingBuffer = useCallback(async () => {
    if (trackingBuffer.current.length === 0) return;

    const eventsToSend = [...trackingBuffer.current];
    trackingBuffer.current = [];

    for (const event of eventsToSend) {
      await sendTrackingEvent(event);
    }
  }, [sendTrackingEvent]);

  const addToTrackingBuffer = useCallback((event: TrackingEvent) => {
    trackingBuffer.current.push(event);

    if (trackingBuffer.current.length >= 10) {
      flushTrackingBuffer();
    }
  }, [flushTrackingBuffer]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied to clipboard!");
  };

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isTracking || !vcardPixel?.is_active) return;

    const now = Date.now();
    if (now - lastMouseMoveTime.current < mouseMoveThrottle) return;

    lastMouseMoveTime.current = now;

    const trackingEvent = createTrackingEvent('mousemove', event, {
      elementType: (event.target as HTMLElement)?.tagName?.toLowerCase(),
      elementId: (event.target as HTMLElement)?.id,
      metadata: {
        movementSpeed: Math.sqrt(
          Math.pow(event.movementX || 0, 2) + Math.pow(event.movementY || 0, 2)
        ),
        scrollPosition: {
          x: window.scrollX,
          y: window.scrollY,
        },
      },
    });

    addToTrackingBuffer(trackingEvent);
  }, [isTracking, vcardPixel?.is_active, mouseMoveThrottle, createTrackingEvent, addToTrackingBuffer]);

  const handleClick = useCallback((event: MouseEvent) => {
    if (!isTracking || !vcardPixel?.is_active) return;

    const target = event.target as HTMLElement;
    const blockElement = target.closest('[data-block-id]');
    const blockId = blockElement?.getAttribute('data-block-id') || undefined;

    const trackingEvent = createTrackingEvent('click', event, {
      elementType: target.tagName?.toLowerCase(),
      elementId: target.id,
      blockId,
      metadata: {
        button: event.button, 
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        detail: event.detail, 
        scrollPosition: {
          x: window.scrollX,
          y: window.scrollY,
        },
      },
    });

    sendTrackingEvent(trackingEvent);
  }, [isTracking, vcardPixel?.is_active, createTrackingEvent, sendTrackingEvent]);

  // Gestionnaire pour le scroll
  const handleScroll = useCallback(() => {
    if (!isTracking || !vcardPixel?.is_active) return;

    const trackingEvent = createTrackingEvent('scroll', undefined, {
      metadata: {
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        scrollHeight: document.documentElement.scrollHeight,
        clientHeight: document.documentElement.clientHeight,
        scrollPercentage: Math.round(
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        ),
      },
    });

    addToTrackingBuffer(trackingEvent);
  }, [isTracking, vcardPixel?.is_active, createTrackingEvent, addToTrackingBuffer]);

  const handleBlockHover = useCallback((blockId: string) => {
    hoverStartTime.current = Date.now();
    currentHoveredBlock.current = blockId;

    // Tracking de l'événement hover
    if (isTracking && vcardPixel?.is_active) {
      const trackingEvent = createTrackingEvent('hover', undefined, {
        blockId,
        metadata: {
          hoverStart: true,
        },
      });
      sendTrackingEvent(trackingEvent);
    }
  }, [isTracking, vcardPixel?.is_active, createTrackingEvent, sendTrackingEvent]);

  const handleBlockLeave = useCallback((blockId: string) => {
    if (hoverStartTime.current && currentHoveredBlock.current === blockId) {
      // Calculer la durée du survol
      const duration = Math.floor((Date.now() - hoverStartTime.current) / 1000);

      // Envoyer l'événement uniquement si le survol a duré plus de 500ms
      if (duration > 0.5) {
        trackEvent({
          eventType: 'hover',
          blockId,
          metadata: { duration }
        });
      }

      hoverStartTime.current = null;
      currentHoveredBlock.current = null;
    }
  }, [trackEvent]);

  const handleBlockAction = (type: string, value: string, blockId?: string) => {
    if (blockId && vcardPixel?.is_active) {
      trackEvent({
        eventType: 'click',
        blockId,
        metadata: { action: type, target: value }
      });
    }

    switch (type) {
      case 'Phone':
        window.location.href = `tel:${value}`;
        break;
      case 'Email':
        window.location.href = `mailto:${value}`;
        break;
      case 'Address':
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`, '_blank');
        break;
      default:
        window.open(value.startsWith('http') ? value : `https://${value}`, '_blank');
        break;
    }
  };

  const handleDownloadVcf = () => {
    if (!vcard) return;

    trackEvent({ eventType: 'download' });

    const vCardData = `BEGIN:VCARD
      VERSION:3.0
      FN:${vcard.name}
      N:;${vcard.name};;;
      URL:${currentUrl}
      NOTE:${vcard.description || ''}
      END:VCARD`;

    const blob = new Blob([vCardData], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${vcard.name.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const shareOnSocial = (platform: string) => {
    trackEvent({
      eventType: 'share',
      metadata: { platform }
    });

    const shareUrl = encodeURIComponent(currentUrl);
    const title = encodeURIComponent(pageTitle);
    const description = encodeURIComponent(pageDescription);
    const imageUrl = encodeURIComponent(pageImage);

    switch (platform) {
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${title}&picture=${imageUrl}`,
          '_blank',
          'width=600,height=400'
        );
        break;

      case 'email':
        const emailSubject = `Check out my digital business card: ${pageTitle}`;
        const emailBody = `${pageDescription}\n\nView my card: ${currentUrl}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        break;

      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?url=${shareUrl}&text=${title}&hashtags=DigitalBusinessCard`,
          '_blank',
          'width=600,height=400'
        );
        break;

      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
          '_blank',
          'width=600,height=400'
        );
        break;

      case 'whatsapp':
        window.open(
          `https://wa.me/?text=${title}%20-%20${shareUrl}`,
          '_blank',
          'width=600,height=400'
        );
        break;

      case 'telegram':
        window.open(
          `https://t.me/share/url?url=${shareUrl}&text=${title}`,
          '_blank',
          'width=600,height=400'
        );
        break;

      case 'pinterest':
        window.open(
          `https://pinterest.com/pin/create/button/?url=${shareUrl}&description=${description}&media=${imageUrl}`,
          '_blank',
          'width=600,height=400'
        );
        break;

      case 'reddit':
        window.open(
          `https://www.reddit.com/submit?url=${shareUrl}&title=${title}`,
          '_blank',
          'width=600,height=400'
        );
        break;

      default:
        break;
    }
  };

  // useEffect pour attacher les gestionnaires d'événements de tracking
  useEffect(() => {
    if (!isTracking || !vcardPixel?.is_active) return;

    // Attacher les gestionnaires d'événements
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll);

    // Configurer le flush automatique du buffer
    bufferFlushInterval.current = setInterval(flushTrackingBuffer, 5000); // Flush toutes les 5 secondes

    // Cleanup function
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);

      if (bufferFlushInterval.current) {
        clearInterval(bufferFlushInterval.current);
      }

      // Flush final du buffer
      flushTrackingBuffer();
    };
  }, [isTracking, vcardPixel?.is_active, handleMouseMove, handleClick, handleScroll, flushTrackingBuffer]);

  // useEffect pour le scroll automatique vers le haut
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [url]);

  // useEffect pour le tracking de la visibilité de la page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page devient invisible, flush le buffer
        flushTrackingBuffer();
        setIsTracking(false);
      } else {
        // Page devient visible, reprendre le tracking
        setIsTracking(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Cleanup final du tracking
      if (bufferFlushInterval.current) {
        clearInterval(bufferFlushInterval.current);
      }
      flushTrackingBuffer();
    };
  }, [flushTrackingBuffer, setIsTracking]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  if (vcardActive) {
    return <div className="min-h-screen bg-white"></div>;
  }

  if (!vcard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">vCard not found</h1>
          <p className="text-primary mt-2">
            The vCard you're looking for doesn't exist or has been deleted or has been disabled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen relative overflow-hidden"
      style={{
        ...getBackgroundStyle(),
        fontFamily: vcard.font_family || 'sans-serif',
        fontSize: `${vcard.font_size || 16}px`
      }}
    >
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />

        <meta property="og:url" content={currentUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={pageImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={pageImage} />
      </Helmet>

      {vcard.background_type === 'custom-image' && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-0"></div>
      )}

      <div className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full filter blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <VCardHeader vcard={vcard} />
        </motion.div>

        {project && project.status === 'active' && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="my-8"
          >
            <div className="relative overflow-hidden rounded-xl shadow-lg bg-white backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80 p-6 border border-gray-100">
              <div
                className="absolute top-0 left-0 w-full h-1"
                style={{ backgroundColor: project.color || '#4f46e5' }}
              ></div>

              <div className="flex flex-col md:flex-row items-center gap-4">
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center shadow-lg"
                  style={{
                    backgroundColor: project.color || '#4f46e5',
                    color: '#ffffff'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Associated Project</span>
                      <h3 className="text-xl font-bold text-gray-900 ">{project.name}</h3>
                    </div>

                    <div
                      className="mt-2 md:mt-0 px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${project.color}20` || '#4f46e520',
                        color: project.color || '#4f46e5'
                      }}
                    >
                      {project.status === 'active' ? 'Actif' : project.status === 'pending' ? 'En attente' : 'Archivé'}
                    </div>
                  </div>

                  {project.description && (
                    <p className="mt-2 text-gray-600 text-sm">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          animate="show"
        >
          {blocks.filter((block: Block) => block.status).map((block) => {
            const iconConfig = blockIcons[block.type_block as keyof typeof blockIcons] || blockIcons.default;
            return (
              <motion.div
                key={block.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                transition={{ duration: 0.2 }}
                onMouseEnter={() => handleBlockHover(block.id)}
                onMouseLeave={() => handleBlockLeave(block.id)}
                data-block-id={block.id}
              >
                <ContactBlock
                  block={block}
                  iconConfig={iconConfig}
                  onClick={() => handleBlockAction(block.type_block, block.description, block.id)}
                />
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <FloatingButtons
            qrCodeUrl={vcard.qr_code}
            isShareEnabled={vcard.is_share}
            onCopy={copyToClipboard}
            onShare={shareOnSocial}
            onDownloadVcf={handleDownloadVcf}
            vcard={{
              name: vcard.name,
              url: vcard.url
            }}
          />
        </motion.div>

        <AnimatePresence>
          {copied && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 left-6 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm shadow-lg z-50"
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Link copied!
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!vcard.remove_branding && (
        <div className="absolute bottom-2 w-full text-center text-xs text-gray-500 dark:text-gray-400 opacity-70 z-10">
          <p>Powered by Digital Business Card</p>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        toastClassName="rounded-lg shadow-lg font-medium"
        hideProgressBar
        closeButton={false}
      />
    </motion.div>
  );
};

export default ViewVCard;