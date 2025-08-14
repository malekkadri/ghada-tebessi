import { useEffect, useRef, useState } from "react";
import Header from "../template front/Header";
import Carousel from "../template front/Carousel";
import Facts from "../template front/Facts";
import Footer from "../template front/Footer";
import About from "../template front/About";
import Features from "../template front/Features";
import PircingPlan from "../template front/PircingPlan";
import Quote from "../template front/Quote";
import Testimonial from "../template front/Testimonial";
import Services from "../template front/Services";
import Team from "../template front/Team";
import SearchModal from "../modals/SearchModal";
import { useWowAnimations } from "../hooks/useWowAnimations";
import CookieConsent from "../components/CookieConsent";
import { visitorService } from "../services/api";

const Home = () => {
    useWowAnimations();
    const visitorIdRef = useRef<string | null>(null);
    const [showCookieBanner, setShowCookieBanner] = useState(false);
    const trackingActive = useRef(false);
    const pageEntryTimeRef = useRef<Date>(new Date()); 
    const hasTrackedRef = useRef(false); 

    const trackExit = async () => {
        if (!trackingActive.current || !visitorIdRef.current) return;
        
        try {
            await visitorService.trackVisitorExit(visitorIdRef.current);
            trackingActive.current = false;
        } catch (error) {
            console.error("Exit tracking failed:", error);
        }
    };

    useEffect(() => {
        const handleBeforeUnload = () => trackExit();
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') trackExit();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            trackExit();
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        const consent = localStorage.getItem("cookieConsent");
        const shouldShowBanner = consent !== "accepted";
        setShowCookieBanner(shouldShowBanner);
        
        if (!hasTrackedRef.current) {
            startTracking();
            hasTrackedRef.current = true;
        }
    }, []);

    const startTracking = async () => {
        if (trackingActive.current) return;
        
        try {
            const response = await visitorService.trackVisitor({
                entryTime: pageEntryTimeRef.current.toISOString()
            });
            visitorIdRef.current = response.visitorId;
            trackingActive.current = true;
        } catch (error) {
            console.error("Visitor tracking error:", error);
        }
    };

    const handleAcceptCookies = () => {
        //localStorage.setItem("cookieConsent", "accepted");
        setShowCookieBanner(false);
    };

    return (
        <>
            <CookieConsent 
                visible={showCookieBanner} 
                onAccept={handleAcceptCookies} 
            />
            <div style={{ width: "100vw", overflowX: "hidden", minWidth: "100vw" }}>
                <Header />
                <div id="home">
                    <Carousel />
                </div>
                <SearchModal />
                <Facts />
                <div id="about">
                    <About />
                </div>
                <div id="features">
                    <Features />
                </div>
                <div id="services">
                    <Services />
                </div>
                <div id="pricing">
                    <PircingPlan />
                </div>
                <div id="contact">
                    <Quote />
                </div>
                <div id="testimonials">
                    <Testimonial />
                </div>
                <div id="team">
                    <Team />
                </div>
                <Footer />
            </div>
        </>
    );
};

export default Home;