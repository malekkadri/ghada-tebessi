import aboutImg from '../assets/styleTemplate/img/about.jpg';

const About = () => {
    return (
        <div className="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s">
            <div className="container py-5">
                <div className="row g-5">
                    <div className="col-lg-7">
                        <div className="section-title position-relative pb-3 mb-5">
                            <h5 className="fw-bold text-primary text-uppercase position-relative">
                                <span className="bg-light px-3 py-1 rounded-pill">About NexCard</span>
                            </h5>
                            <h1 className="mb-0 mt-2 position-relative">
                                Digital Business Card Platform with 
                                <span className="text-primary"> Advanced Features</span>
                            </h1>
                            <div className="position-absolute bottom-0 start-0" 
                                 style={{ width: "80px", height: "3px", backgroundColor: "var(--bs-primary)" }}></div>
                        </div>
                        <p className="mb-4 fs-6 text-muted lh-lg">
                            NexCard is a comprehensive digital business card platform that revolutionizes how professionals 
                            share their contact information. Built with React, TypeScript, and modern web technologies, 
                            our platform offers seamless vCard creation, project management, and advanced analytics to help 
                            you build meaningful business connections.
                        </p>
                        
                        <div className="row g-3 mb-4">
                            <div className="col-sm-6 wow zoomIn" data-wow-delay="0.2s">
                                <div className="d-flex align-items-center p-3 rounded-3 bg-light border-start border-primary border-4 h-100 position-relative overflow-hidden"
                                     style={{ transition: "all 0.3s ease" }}
                                     onMouseEnter={(e) => {
                                         e.currentTarget.style.transform = "translateX(5px)";
                                         e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
                                     }}
                                     onMouseLeave={(e) => {
                                         e.currentTarget.style.transform = "translateX(0)";
                                         e.currentTarget.style.boxShadow = "";
                                     }}>
                                    <div className="me-3">
                                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
                                             style={{ width: "40px", height: "40px" }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <h6 className="mb-1 fw-bold">Responsive Design</h6>
                                        <small className="text-muted">Adapts to all devices</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6 wow zoomIn" data-wow-delay="0.3s">
                                <div className="d-flex align-items-center p-3 rounded-3 bg-light border-start border-primary border-4 h-100 position-relative overflow-hidden"
                                     style={{ transition: "all 0.3s ease" }}
                                     onMouseEnter={(e) => {
                                         e.currentTarget.style.transform = "translateX(5px)";
                                         e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
                                     }}
                                     onMouseLeave={(e) => {
                                         e.currentTarget.style.transform = "translateX(0)";
                                         e.currentTarget.style.boxShadow = "";
                                     }}>
                                    <div className="me-3">
                                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
                                             style={{ width: "40px", height: "40px" }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                                <path d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <h6 className="mb-1 fw-bold">Custom vCards</h6>
                                        <small className="text-muted">Personalized business cards</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6 wow zoomIn" data-wow-delay="0.4s">
                                <div className="d-flex align-items-center p-3 rounded-3 bg-light border-start border-primary border-4 h-100 position-relative overflow-hidden"
                                     style={{ transition: "all 0.3s ease" }}
                                     onMouseEnter={(e) => {
                                         e.currentTarget.style.transform = "translateX(5px)";
                                         e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
                                     }}
                                     onMouseLeave={(e) => {
                                         e.currentTarget.style.transform = "translateX(0)";
                                         e.currentTarget.style.boxShadow = "";
                                     }}>
                                    <div className="me-3">
                                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
                                             style={{ width: "40px", height: "40px" }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <h6 className="mb-1 fw-bold">Project Management</h6>
                                        <small className="text-muted">Organize your workflow</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6 wow zoomIn" data-wow-delay="0.5s">
                                <div className="d-flex align-items-center p-3 rounded-3 bg-light border-start border-primary border-4 h-100 position-relative overflow-hidden"
                                     style={{ transition: "all 0.3s ease" }}
                                     onMouseEnter={(e) => {
                                         e.currentTarget.style.transform = "translateX(5px)";
                                         e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
                                     }}
                                     onMouseLeave={(e) => {
                                         e.currentTarget.style.transform = "translateX(0)";
                                         e.currentTarget.style.boxShadow = "";
                                     }}>
                                    <div className="me-3">
                                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
                                             style={{ width: "40px", height: "40px" }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                                <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zm-8-2h2v-4h4v-2h-4V7h-2v4H7v2h4v4z"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <h6 className="mb-1 fw-bold">API Integration</h6>
                                        <small className="text-muted">Seamless connectivity</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="d-flex align-items-center mb-4 wow fadeIn p-4 rounded-4 border position-relative overflow-hidden" 
                             data-wow-delay="0.6s"
                             style={{ 
                                 background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                                 transition: "all 0.3s ease"
                             }}
                             onMouseEnter={(e) => {
                                 e.currentTarget.style.transform = "scale(1.02)";
                                 e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)";
                             }}
                             onMouseLeave={(e) => {
                                 e.currentTarget.style.transform = "scale(1)";
                                 e.currentTarget.style.boxShadow = "";
                             }}>
                            <div className="position-absolute top-0 end-0" style={{ opacity: "0.05" }}>
                                <svg width="80" height="80" viewBox="0 0 24 24" fill="var(--bs-primary)">
                                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                                </svg>
                            </div>
                            <div className="bg-primary d-flex align-items-center justify-content-center rounded-3 me-4 shadow-sm" 
                                style={{ width: "60px", height: "60px" }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                                </svg>
                            </div>
                            <div className="position-relative">
                                <h5 className="mb-2 fw-bold">Contact us for more information</h5>
                                <h4 className="text-primary mb-0 fw-bold">contact@nexcard.com</h4>
                                <small className="text-muted">We respond within 24 hours</small>
                            </div>
                        </div>
                        
                        {/* Button amélioré */}
                        <a href="/sign-up" 
                           className="btn btn-primary py-3 px-5 mt-3 wow zoomIn rounded-pill fw-bold position-relative overflow-hidden" 
                           data-wow-delay="0.9s"
                           style={{ 
                               transition: "all 0.3s ease",
                               boxShadow: "0 4px 15px rgba(6, 163, 218, 0.3)"
                           }}
                           onMouseEnter={(e) => {
                               e.currentTarget.style.transform = "translateY(-2px)";
                               e.currentTarget.style.boxShadow = "0 8px 25px rgba(6, 163, 218, 0.4)";
                           }}
                           onMouseLeave={(e) => {
                               e.currentTarget.style.transform = "translateY(0)";
                               e.currentTarget.style.boxShadow = "0 4px 15px rgba(6, 163, 218, 0.3)";
                           }}>
                            <span className="me-2">Get Started Now</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                            </svg>
                        </a>
                    </div>
                    <div className="col-lg-5" style={{ minHeight: "500px" }}>
                        <div className="position-relative h-100">
                            <img className="position-absolute w-100 h-100 rounded wow zoomIn" 
                                data-wow-delay="0.9s" 
                                src={aboutImg} 
                                alt="About Us"
                                style={{ objectFit: "cover" }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
