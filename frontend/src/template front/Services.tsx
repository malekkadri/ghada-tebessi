const Services = () => {
    return (
        <div className="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s">
            <div className="container py-5">
                <div className="section-title text-center position-relative pb-3 mb-5 mx-auto" style={{ maxWidth: "600px" }}>
                    <h5 className="fw-bold text-primary text-uppercase position-relative">
                        <span className="bg-light px-3 py-1 rounded-pill">Our Services</span>
                    </h5>
                    <h1 className="mb-0 mt-2">Complete Solutions for Your Digital Business Cards</h1>
                    <div className="position-absolute bottom-0 start-50 translate-middle-x" 
                         style={{ width: "80px", height: "3px", backgroundColor: "var(--bs-primary)" }}></div>
                </div>
                <div className="row g-5">
                    {[
                        { icon: "fa-id-card", title: "vCard Creation", description: "Easily create custom digital business cards" },
                        { icon: "fa-project-diagram", title: "Project Management", description: "Organize and manage your vCard projects efficiently" },
                        { icon: "fa-chart-line", title: "Analytics Tracking", description: "Analyze your vCards performance with detailed statistics" },
                        { icon: "fa-shield-alt", title: "Authentication", description: "Secure your data with our robust authentication system" },
                        { icon: "fa-mobile-alt", title: "Multi-Platform", description: "Access your vCards from any device" },
                    ].map((service, index) => (
                        <div key={index} className="col-lg-4 col-md-6 wow zoomIn" data-wow-delay={`${0.3 * (index % 3 + 1)}s`}>
                            <div className="service-item bg-light rounded-3 d-flex flex-column align-items-center justify-content-center text-center p-4 h-100 position-relative overflow-hidden shadow-sm border"
                                 style={{ 
                                     transition: "all 0.3s ease-in-out",
                                     transform: "translateY(0)"
                                 }}
                                 onMouseEnter={(e) => {
                                     e.currentTarget.style.transform = "translateY(-10px)";
                                     e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.15)";
                                     e.currentTarget.style.borderColor = "var(--bs-primary)";
                                     const icon = e.currentTarget.querySelector('.service-icon') as HTMLElement;
                                     if (icon) icon.style.transform = "scale(1.1) rotate(5deg)";
                                 }}
                                 onMouseLeave={(e) => {
                                     e.currentTarget.style.transform = "translateY(0)";
                                     e.currentTarget.style.boxShadow = "";
                                     e.currentTarget.style.borderColor = "";
                                     const icon = e.currentTarget.querySelector('.service-icon') as HTMLElement;
                                     if (icon) icon.style.transform = "scale(1) rotate(0deg)";
                                 }}>
                                
                                <div className="position-absolute top-0 end-0 opacity-10 m-3">
                                    <i className={`fa ${service.icon}`} style={{ fontSize: "3rem", color: "var(--bs-primary)" }}></i>
                                </div>
                                
                                <div className="service-icon bg-primary d-flex align-items-center justify-content-center mb-4 shadow"
                                     style={{ 
                                         width: "80px", 
                                         height: "80px",
                                         transform: "rotate(45deg)",
                                         transition: "all 0.3s ease-in-out"
                                     }}>
                                    <i className={`fa ${service.icon} text-white`} style={{ fontSize: "2rem", transform: "rotate(-45deg)" }}></i>
                                </div>
                                <h4 className="mb-3 fw-bold">{service.title}</h4>
                                <p className="mb-4 text-muted flex-grow-1">{service.description}</p>
                                <div className="d-flex justify-content-center w-100 mb-3">
                                    <a className="btn btn-primary rounded-pill px-5 py-2 position-relative overflow-hidden" 
                                       href="/sign-up"
                                       style={{ 
                                           transition: "all 0.3s ease",
                                           boxShadow: "0 4px 15px rgba(6, 163, 218, 0.3)",
                                           fontSize: "0.875rem",
                                           minWidth: "150px"
                                       }}
                                       onMouseEnter={(e) => {
                                           e.currentTarget.style.transform = "translateY(-2px)";
                                           e.currentTarget.style.boxShadow = "0 8px 25px rgba(6, 163, 218, 0.4)";
                                       }}
                                       onMouseLeave={(e) => {
                                           e.currentTarget.style.transform = "translateY(0)";
                                           e.currentTarget.style.boxShadow = "0 4px 15px rgba(6, 163, 218, 0.3)";
                                       }}>
                                        <span className="me-2">Learn More</span>
                                        <i className="fa fa-arrow-right"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="col-lg-4 col-md-6 wow zoomIn" data-wow-delay="0.9s">
                        <div className="position-relative bg-primary rounded-3 h-100 d-flex flex-column align-items-center justify-content-center text-center p-5 overflow-hidden shadow-lg border"
                             style={{ 
                                 transition: "all 0.3s ease-in-out",
                                 transform: "translateY(0)"
                             }}
                             onMouseEnter={(e) => {
                                 e.currentTarget.style.transform = "translateY(-10px) scale(1.02)";
                                 e.currentTarget.style.boxShadow = "0 20px 40px rgba(6, 163, 218, 0.3)";
                             }}
                             onMouseLeave={(e) => {
                                 e.currentTarget.style.transform = "translateY(0) scale(1)";
                                 e.currentTarget.style.boxShadow = "";
                             }}>
                            
                            <div className="position-absolute top-0 end-0 opacity-10">
                                <i className="fa fa-rocket" style={{ fontSize: "5rem", color: "white", transform: "rotate(15deg)", margin: "1rem" }}></i>
                            </div>
                            <div className="position-absolute bottom-0 start-0 opacity-10">
                                <i className="fa fa-star" style={{ fontSize: "3rem", color: "white", transform: "rotate(-15deg)", margin: "1rem" }}></i>
                            </div>
                            
                            <div className="bg-white rounded-circle d-flex align-items-center justify-content-center mb-4 shadow-lg"
                                 style={{ 
                                     width: "80px", 
                                     height: "80px"
                                 }}>
                                <i className="fa fa-play text-primary" style={{ fontSize: "2rem" }}></i>
                            </div>
                            
                            <h3 className="text-white mb-3 fw-bold">Ready to Get Started?</h3>
                            <p className="text-white mb-4 opacity-90">Join thousands of professionals who trust NexCard for their digital business cards</p>
                            
                            <a href="/sign-up" 
                               className="btn btn-light btn-lg rounded-pill px-5 py-3 fw-bold position-relative overflow-hidden"
                               style={{ 
                                   transition: "all 0.3s ease",
                                   boxShadow: "0 6px 20px rgba(255,255,255,0.3)"
                               }}
                               onMouseEnter={(e) => {
                                   e.currentTarget.style.transform = "translateY(-3px) scale(1.05)";
                                   e.currentTarget.style.boxShadow = "0 10px 30px rgba(255,255,255,0.4)";
                               }}
                               onMouseLeave={(e) => {
                                   e.currentTarget.style.transform = "translateY(0) scale(1)";
                                   e.currentTarget.style.boxShadow = "0 6px 20px rgba(255,255,255,0.3)";
                               }}>
                                <span className="me-2">Start Free Trial</span>
                                <i className="fa fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Services;
