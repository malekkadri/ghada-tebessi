const Footer = () => {
    return (
        <>
            <div className="container-fluid bg-dark text-light mt-5 wow fadeInUp" data-wow-delay="0.1s">
                <div className="container">
                    <div className="row gx-5 align-items-stretch">
                        <div className="col-lg-4 col-md-6 d-flex">
                            <div className="d-flex flex-column align-items-center justify-content-center text-center w-100 bg-primary p-4 h-100 position-relative overflow-hidden"
                                 style={{ 
                                     background: "linear-gradient(135deg, var(--bs-primary) 0%, #0056b3 100%)",
                                     borderRadius: "0 0 0 15px"
                                 }}>
                                
                                <div className="position-absolute top-0 end-0 opacity-10">
                                    <i className="fa fa-address-card" style={{ fontSize: "8rem", color: "white" }}></i>
                                </div>
                                
                                <a href="/" className="navbar-brand position-relative z-index-2">
                                    <h1 className="m-0 text-white fw-bold">
                                        <i className="fa fa-address-card me-2"></i>NexCard
                                    </h1>
                                </a>
                                <p className="mt-3 mb-4 text-white-50 position-relative z-index-2">
                                    Revolutionize your professional connections with innovative 
                                    and eco-friendly digital business cards.
                                </p>
                            </div>
                        </div>

                        <div className="col-lg-8 col-md-6 d-flex">
                            <div className="row gx-5 w-100 h-100">
                                <div className="col-lg-4 col-md-12 pt-5 mb-5">
                                    <div className="section-title section-title-sm position-relative pb-3 mb-4">
                                        <h3 className="text-light mb-0 fw-bold">
                                            <i className="fa fa-map-marker-alt text-primary me-2"></i>Contact
                                        </h3>
                                        <div className="bg-primary" style={{ width: "50px", height: "2px", marginTop: "8px" }}></div>
                                    </div>
                                    <div className="d-flex mb-3 align-items-center">
                                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                                             style={{ width: "35px", height: "35px", minWidth: "35px" }}>
                                            <i className="bi bi-geo-alt text-white"></i>
                                        </div>
                                        <p className="mb-0 text-light">Tunis, Tunisia</p>
                                    </div>
                                    <div className="d-flex mb-3 align-items-center">
                                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                                             style={{ width: "35px", height: "35px", minWidth: "35px" }}>
                                            <i className="bi bi-envelope-open text-white"></i>
                                        </div>
                                        <p className="mb-0 text-light">contact@nexcard.tn</p>
                                    </div>
                                    <div className="d-flex mb-4 align-items-center">
                                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                                             style={{ width: "35px", height: "35px", minWidth: "35px" }}>
                                            <i className="bi bi-telephone text-white"></i>
                                        </div>
                                        <p className="mb-0 text-light">+216 70 123 456</p>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <a className="btn btn-primary btn-square d-flex align-items-center justify-content-center" 
                                           href="#" 
                                           target="_blank"
                                           rel="noopener noreferrer"
                                           style={{ width: "40px", height: "40px" }}
                                           title="Facebook">
                                            <i className="fab fa-facebook-f fw-normal"></i>
                                        </a>
                                        <a className="btn btn-primary btn-square d-flex align-items-center justify-content-center" 
                                           href="#" 
                                           target="_blank"
                                           rel="noopener noreferrer"
                                           style={{ width: "40px", height: "40px" }}
                                           title="LinkedIn">
                                            <i className="fab fa-linkedin-in fw-normal"></i>
                                        </a>
                                        <a className="btn btn-primary btn-square d-flex align-items-center justify-content-center" 
                                           href="#" 
                                           target="_blank"
                                           rel="noopener noreferrer"
                                           style={{ width: "40px", height: "40px" }}
                                           title="Instagram">
                                            <i className="fab fa-instagram fw-normal"></i>
                                        </a>
                                        <a className="btn btn-primary btn-square d-flex align-items-center justify-content-center" 
                                           href="#" 
                                           target="_blank"
                                           rel="noopener noreferrer"
                                           style={{ width: "40px", height: "40px" }}
                                           title="Twitter">
                                            <i className="fab fa-twitter fw-normal"></i>
                                        </a>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-12 pt-0 pt-lg-5 mb-5">
                                    <div className="section-title section-title-sm position-relative pb-3 mb-4">
                                        <h3 className="text-light mb-0 fw-bold">
                                            <i className="fa fa-link text-primary me-2"></i>Navigation
                                        </h3>
                                        <div className="bg-primary" style={{ width: "50px", height: "2px", marginTop: "8px" }}></div>
                                    </div>
                                    <div className="link-animated d-flex flex-column justify-content-start">
                                        <a className="text-light mb-2 d-flex align-items-center text-decoration-none" 
                                           href="#"
                                           style={{ transition: "all 0.3s ease" }}
                                           onMouseEnter={(e) => e.currentTarget.style.color = "var(--bs-primary)"}
                                           onMouseLeave={(e) => e.currentTarget.style.color = ""}>
                                            <i className="bi bi-arrow-right text-primary me-2"></i>Home
                                        </a>
                                        <a className="text-light mb-2 d-flex align-items-center text-decoration-none" 
                                           href="#"
                                           style={{ transition: "all 0.3s ease" }}
                                           onMouseEnter={(e) => e.currentTarget.style.color = "var(--bs-primary)"}
                                           onMouseLeave={(e) => e.currentTarget.style.color = ""}>
                                            <i className="bi bi-arrow-right text-primary me-2"></i>About Us
                                        </a>
                                        <a className="text-light mb-2 d-flex align-items-center text-decoration-none" 
                                           href="#"
                                           style={{ transition: "all 0.3s ease" }}
                                           onMouseEnter={(e) => e.currentTarget.style.color = "var(--bs-primary)"}
                                           onMouseLeave={(e) => e.currentTarget.style.color = ""}>
                                            <i className="bi bi-arrow-right text-primary me-2"></i>Our Services
                                        </a>
                                        <a className="text-light mb-2 d-flex align-items-center text-decoration-none" 
                                           href="#"
                                           style={{ transition: "all 0.3s ease" }}
                                           onMouseEnter={(e) => e.currentTarget.style.color = "var(--bs-primary)"}
                                           onMouseLeave={(e) => e.currentTarget.style.color = ""}>
                                            <i className="bi bi-arrow-right text-primary me-2"></i>Our Team
                                        </a>
                                        <a className="text-light mb-2 d-flex align-items-center text-decoration-none" 
                                           href="#"
                                           style={{ transition: "all 0.3s ease" }}
                                           onMouseEnter={(e) => e.currentTarget.style.color = "var(--bs-primary)"}
                                           onMouseLeave={(e) => e.currentTarget.style.color = ""}>
                                            <i className="bi bi-arrow-right text-primary me-2"></i>Pricing
                                        </a>
                                        <a className="text-light d-flex align-items-center text-decoration-none" 
                                           href="#"
                                           style={{ transition: "all 0.3s ease" }}
                                           onMouseEnter={(e) => e.currentTarget.style.color = "var(--bs-primary)"}
                                           onMouseLeave={(e) => e.currentTarget.style.color = ""}>
                                            <i className="bi bi-arrow-right text-primary me-2"></i>Contact
                                        </a>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-12 pt-0 pt-lg-5 mb-5">
                                    <div className="section-title section-title-sm position-relative pb-3 mb-4">
                                        <h3 className="text-light mb-0 fw-bold">
                                            <i className="fa fa-cog text-primary me-2"></i>Solutions
                                        </h3>
                                        <div className="bg-primary" style={{ width: "50px", height: "2px", marginTop: "8px" }}></div>
                                    </div>
                                    <div className="link-animated d-flex flex-column justify-content-start">
                                        <a className="text-light mb-2 d-flex align-items-center text-decoration-none" 
                                           href="#"
                                           style={{ transition: "all 0.3s ease" }}
                                           onMouseEnter={(e) => e.currentTarget.style.color = "var(--bs-primary)"}
                                           onMouseLeave={(e) => e.currentTarget.style.color = ""}>
                                            <i className="bi bi-arrow-right text-primary me-2"></i>Digital Cards
                                        </a>
                                        <a className="text-light mb-2 d-flex align-items-center text-decoration-none" 
                                           href="#"
                                           style={{ transition: "all 0.3s ease" }}
                                           onMouseEnter={(e) => e.currentTarget.style.color = "var(--bs-primary)"}
                                           onMouseLeave={(e) => e.currentTarget.style.color = ""}>
                                            <i className="bi bi-arrow-right text-primary me-2"></i>Tracking Analytics
                                        </a>
                                        <a className="text-light mb-2 d-flex align-items-center text-decoration-none" 
                                           href="#"
                                           style={{ transition: "all 0.3s ease" }}
                                           onMouseEnter={(e) => e.currentTarget.style.color = "var(--bs-primary)"}
                                           onMouseLeave={(e) => e.currentTarget.style.color = ""}>
                                            <i className="bi bi-arrow-right text-primary me-2"></i>Custom Domains
                                        </a>
                                        <a className="text-light mb-2 d-flex align-items-center text-decoration-none" 
                                           href="#"
                                           style={{ transition: "all 0.3s ease" }}
                                           onMouseEnter={(e) => e.currentTarget.style.color = "var(--bs-primary)"}
                                           onMouseLeave={(e) => e.currentTarget.style.color = ""}>
                                            <i className="bi bi-arrow-right text-primary me-2"></i>API Integration
                                        </a>
                                        <a className="text-light mb-2 d-flex align-items-center text-decoration-none" 
                                           href="#"
                                           style={{ transition: "all 0.3s ease" }}
                                           onMouseEnter={(e) => e.currentTarget.style.color = "var(--bs-primary)"}
                                           onMouseLeave={(e) => e.currentTarget.style.color = ""}>
                                            <i className="bi bi-arrow-right text-primary me-2"></i>24/7 Support
                                        </a>
                                        <a className="text-light d-flex align-items-center text-decoration-none" 
                                           href="#"
                                           style={{ transition: "all 0.3s ease" }}
                                           onMouseEnter={(e) => e.currentTarget.style.color = "var(--bs-primary)"}
                                           onMouseLeave={(e) => e.currentTarget.style.color = ""}>
                                            <i className="bi bi-arrow-right text-primary me-2"></i>Documentation
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="container-fluid bg-dark border-top border-secondary py-4">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-md-6 text-center text-md-start">
                                <p className="mb-0 text-light">
                                    <i className="fa fa-copyright text-primary me-2"></i>
                                    <strong>2025 NexCard.</strong> All rights reserved.
                                </p>
                            </div>
                            {/*<div className="col-md-6 text-center text-md-end">
                                <div className="d-flex justify-content-center justify-content-md-end gap-3 flex-wrap">
                                    <a href="#" className="text-light text-decoration-none small"
                                       style={{ transition: "color 0.3s ease" }}
                                       onMouseEnter={(e) => e.currentTarget.style.color = "var(--bs-primary)"}
                                       onMouseLeave={(e) => e.currentTarget.style.color = ""}>
                                        Privacy Policy
                                    </a>
                                    <span className="text-muted">|</span>
                                    <a href="#" className="text-light text-decoration-none small"
                                       style={{ transition: "color 0.3s ease" }}
                                       onMouseEnter={(e) => e.currentTarget.style.color = "var(--bs-primary)"}
                                       onMouseLeave={(e) => e.currentTarget.style.color = ""}>
                                        Terms of Service
                                    </a>
                                    <span className="text-muted">|</span>
                                    <a href="#" className="text-light text-decoration-none small"
                                       style={{ transition: "color 0.3s ease" }}
                                       onMouseEnter={(e) => e.currentTarget.style.color = "var(--bs-primary)"}
                                       onMouseLeave={(e) => e.currentTarget.style.color = ""}>
                                        Support
                                    </a>
                                </div>
                            </div>*/}
                        </div>
                        
                        <div className="row mt-3 pt-3 border-top border-secondary">
                            <div className="col-12 text-center">
                                <p className="mb-0 text-muted small">
                                    Developed with <i className="fa fa-heart text-danger mx-1"></i> by the NexCard team |
                                    <span className="text-primary ms-1">Revolutionize your professional connections</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Footer;
