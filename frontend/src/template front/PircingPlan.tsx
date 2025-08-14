import { useState, useEffect } from 'react';
import { planService } from '../services/api';
import { Plan } from '../services/Plan';

const PricingPlan = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setLoading(true);
                const response = await planService.getAllPlans();
                if (response.data) {
                    const filteredPlans = response.data
                        .filter(plan => plan.is_active)
                        .slice(0, 3); 
                    setPlans(filteredPlans);
                }
            } catch (err) {
                console.error('Error fetching plans:', err);
                setError('Failed to load pricing plans');
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    if (loading) {
        return (
            <div className="container-fluid py-5 d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s">
            <div className="container py-5">
                <div className="section-title text-center position-relative pb-3 mb-5 mx-auto" style={{ maxWidth: "600px" }}>
                    <h5 className="fw-bold text-primary text-uppercase position-relative">
                        <span className="bg-light px-3 py-1 rounded-pill mb-1">Pricing Plans</span>
                    </h5>
                    <h1 className="mb-0 mt-2">Choose the Perfect NexCard Plan for Your Business</h1>
                    <div className="position-absolute bottom-0 start-50 translate-middle-x" 
                         style={{ width: "80px", height: "3px", backgroundColor: "var(--bs-primary)" }}></div>
                </div>
                
                {error && (
                    <div className="alert alert-warning text-center mb-4">
                        <i className="fa fa-exclamation-triangle me-2"></i>
                        {error}
                    </div>
                )}

                <div className="row g-4 justify-content-center pricing-row">
                    {plans.map((plan, index) => (
                        <div key={plan.id} className="col-lg-4 col-md-6 wow slideInUp" data-wow-delay={`${0.3 * (index + 1)}s`}>
                            <div className={`pricing-card h-100 position-relative rounded-4 overflow-hidden shadow-lg border ${
                                index === 1 ? 'bg-white border-primary' : 'bg-light'
                            }`}
                                 style={{ 
                                     transition: "all 0.3s ease-in-out",
                                     transform: "translateY(0)"
                                 }}
                                 onMouseEnter={(e) => {
                                     e.currentTarget.style.transform = "translateY(-10px)";
                                     e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.15)";
                                 }}
                                 onMouseLeave={(e) => {
                                     e.currentTarget.style.transform = "translateY(0)";
                                     e.currentTarget.style.boxShadow = "";
                                 }}>
                                
                                {/* Badge pour plan populaire */}
                                {index === 1 && (
                                    <div className="position-absolute top-0 end-0 bg-primary text-white px-3 py-1 rounded-start-3">
                                        <small className="fw-bold">Most Popular</small>
                                    </div>
                                )}

                                {/* Header */}
                                <div className="pricing-header text-center p-4 border-bottom">
                                    <div>
                                        <div className={`bg-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 ${
                                            index === 1 ? 'shadow-lg' : 'shadow'
                                        }`}
                                             style={{ width: "80px", height: "80px" }}>
                                            {index === 0 && <i className="fa fa-gift text-white" style={{ fontSize: "2rem" }}></i>}
                                            {index === 1 && <i className="fa fa-star text-white" style={{ fontSize: "2rem" }}></i>}
                                            {index === 2 && <i className="fa fa-crown text-white" style={{ fontSize: "2rem" }}></i>}
                                        </div>
                                        <h4 className="text-primary fw-bold mb-1">{plan.name} Plan</h4>
                                        <small className="text-muted text-uppercase d-block mb-3">{plan.description}</small>
                                    </div>
                                    {/* Ligne décorative uniforme pour tous les plans */}
                                    <div className="d-flex justify-content-center">
                                        <div 
                                            className="bg-primary rounded-pill" 
                                            style={{ 
                                                width: "60px", 
                                                height: "3px",
                                                opacity: "0.7"
                                            }}>
                                        </div>
                                    </div>
                                </div>

                                {/* Prix */}
                                <div className="pricing-price text-center p-4">
                                    <h1 className="display-4 fw-bold mb-3">
                                        <small className="align-top text-muted" style={{ fontSize: "1.5rem" }}>$</small>
                                        {plan.price}
                                        <small className="align-bottom text-muted" style={{ fontSize: "1rem" }}>
                                            {plan.price === "0" ? "" : "/ Month"}
                                        </small>
                                    </h1>
                                </div>

                                {/* Features */}
                                <div className="pricing-features px-4">
                                    <ul className="pricing-features-list">
                                        {plan.features.map((feature, featureIndex) => (
                                            <li key={featureIndex} className="pricing-feature-item d-flex align-items-center mb-3">
                                                <div className="bg-success rounded-circle d-flex align-items-center justify-content-center me-3"
                                                     style={{ width: "24px", height: "24px", minWidth: "24px" }}>
                                                    <i className="fa fa-check text-white" style={{ fontSize: "0.75rem" }}></i>
                                                </div>
                                                <span className="text-dark">{feature}</span>
                                            </li>
                                        ))}
                                        {/* Ajouter des éléments vides pour égaliser la hauteur si nécessaire */}
                                        {Array.from({ length: Math.max(0, 5 - plan.features.length) }).map((_, emptyIndex) => (
                                            <li key={`empty-${emptyIndex}`} className="pricing-feature-item" style={{ visibility: 'hidden' }}>
                                                <div className="bg-success rounded-circle d-flex align-items-center justify-content-center me-3"
                                                     style={{ width: "24px", height: "24px", minWidth: "24px" }}>
                                                    <i className="fa fa-check text-white" style={{ fontSize: "0.75rem" }}></i>
                                                </div>
                                                <span className="text-dark">Placeholder</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Button */}
                                <div className="pricing-button p-4 pt-0">
                                    <div className="pricing-button-container">
                                        <a href="/sign-up" 
                                           className={`btn w-100 py-3 rounded-pill fw-bold position-relative overflow-hidden ${
                                               index === 1 ? 'btn-primary' : 'btn-outline-primary'
                                           }`}
                                           style={{ 
                                               transition: "all 0.3s ease",
                                               boxShadow: index === 1 ? "0 4px 15px rgba(6, 163, 218, 0.3)" : ""
                                           }}
                                           onMouseEnter={(e) => {
                                               e.currentTarget.style.transform = "translateY(-2px)";
                                               if (index === 1) {
                                                   e.currentTarget.style.boxShadow = "0 8px 25px rgba(6, 163, 218, 0.4)";
                                               }
                                           }}
                                           onMouseLeave={(e) => {
                                               e.currentTarget.style.transform = "translateY(0)";
                                               if (index === 1) {
                                                   e.currentTarget.style.boxShadow = "0 4px 15px rgba(6, 163, 218, 0.3)";
                                               }
                                           }}>
                                            {plan.price === "0" ? "Start Free" : "Get Started"}
                                            <i className="fa fa-arrow-right ms-2"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PricingPlan;
