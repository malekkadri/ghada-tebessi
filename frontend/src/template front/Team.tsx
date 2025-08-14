import '../styles/team-custom.css';

const teamMembers = [
    {
        name: "Eya Grati",
        position: "Fullstack Developer",
        image: "src/assets/styleTemplate/img/eya.png",
        description: "Passionate about creating innovative digital solutions and modern web applications.",
        skills: ["React", "TypeScript", "Node.js", "MySQL"],
        socialLinks: {
            facebook: "https://www.facebook.com/aya.youta.16/",
            instagram: "https://www.instagram.com/eya_grati/",
            linkedin: "https://www.linkedin.com/in/eya-grati-153458272/",
            github: "https://github.com/EyaGrati"
        }
    },
    {
        name: "Ghada Tebessi",
        position: "Data Scientist",
        image: "src/assets/styleTemplate/img/ghada.jpg",
        description: "Specialized in data analysis, machine learning, and business intelligence solutions.",
        skills: ["Python", "Machine Learning", "Data Analysis", "AI"],
        socialLinks: {
            facebook: "https://www.facebook.com/ghada.tebessi21",
            instagram: "https://www.instagram.com/ghadatebessi_/",
            linkedin: "https://www.linkedin.com/in/ghada-tebessi/",
            github: "#"
        }
    }
];

const Team = () => {
    return (
        <div className="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s">
            <div className="container py-5">
                <div className="section-title text-center position-relative pb-3 mb-5 mx-auto" style={{ maxWidth: "600px" }}>
                    <h5 className="fw-bold text-primary text-uppercase position-relative">
                        <span className="bg-light px-3 py-1 rounded-pill">Our Team</span>
                    </h5>
                    <h1 className="mb-0 mt-2 position-relative">
                        Meet the 
                        <span className="text-primary"> NexCard Team</span> Behind Your Success
                    </h1>
                    <div className="position-absolute bottom-0 start-50 translate-middle-x" 
                         style={{ width: "80px", height: "3px", backgroundColor: "var(--bs-primary)" }}></div>
                </div>
                <div className="row g-5 justify-content-center">
                    {teamMembers.map((member, index) => (
                        <div className="col-lg-5 col-md-6 wow slideInUp" data-wow-delay={`${0.3 + index * 0.3}s`} key={index}>
                            <div className="team-item bg-light rounded-3 text-center p-4 h-100 position-relative overflow-hidden shadow-sm border"
                                 style={{ 
                                     transition: "all 0.3s ease-in-out",
                                     transform: "translateY(0)",
                                     background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)"
                                 }}
                                 onMouseEnter={(e) => {
                                     e.currentTarget.style.transform = "translateY(-10px)";
                                     e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.15)";
                                     e.currentTarget.style.borderColor = "var(--bs-primary)";
                                 }}
                                 onMouseLeave={(e) => {
                                     e.currentTarget.style.transform = "translateY(0)";
                                     e.currentTarget.style.boxShadow = "";
                                     e.currentTarget.style.borderColor = "";
                                 }}>
                                
                                <div className="position-absolute top-0 end-0 m-3" style={{ opacity: "0.1" }}>
                                    <i className="fa fa-user-tie" style={{ fontSize: "3rem", color: "var(--bs-primary)" }}></i>
                                </div>
                                
                                <div className="team-img position-relative mb-4">
                                    <div className="position-relative d-inline-block">
                                        <img className="rounded-circle shadow border-3 border-white" 
                                             src={member.image} 
                                             alt={member.name}
                                             style={{ width: "120px", height: "120px", objectFit: "cover" }} />
                                        <div className="position-absolute bottom-0 end-0 bg-primary rounded-circle d-flex align-items-center justify-content-center"
                                             style={{ width: "35px", height: "35px" }}>
                                            <i className="fa fa-check text-white" style={{ fontSize: "16px" }}></i>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mb-3">
                                    <h4 className="text-primary fw-bold mb-1">{member.name}</h4>
                                    <p className="text-muted text-uppercase fw-bold mb-2">{member.position}</p>
                                    <p className="text-muted mb-3 lh-lg">{member.description}</p>
                                </div>
                                
                                <div className="mb-4">
                                    <h6 className="text-primary mb-2">Skills & Expertise</h6>
                                    <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
                                        {member.skills.map((skill, skillIndex) => (
                                            <span key={skillIndex} className="badge bg-primary rounded-pill px-3 py-2">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                    
                                    <div className="d-flex justify-content-center align-items-center gap-2 flex-nowrap"
                                         style={{ position: "relative", zIndex: "10" }}>
                                        <a className="btn btn-outline-primary btn-sm rounded-circle d-flex align-items-center justify-content-center" 
                                           href={member.socialLinks.linkedin}
                                           target="_blank"
                                           rel="noopener noreferrer"
                                           style={{ 
                                               width: "32px", 
                                               height: "32px", 
                                               fontSize: "12px",
                                               opacity: "1 !important",
                                               marginTop: "0 !important"
                                           }}
                                           title="LinkedIn">
                                            <i className="fab fa-linkedin-in"></i>
                                        </a>
                                        <a className="btn btn-outline-primary btn-sm rounded-circle d-flex align-items-center justify-content-center" 
                                           href={member.socialLinks.github}
                                           target="_blank"
                                           rel="noopener noreferrer"
                                           style={{ 
                                               width: "32px", 
                                               height: "32px", 
                                               fontSize: "12px",
                                               opacity: "1 !important",
                                               marginTop: "0 !important"
                                           }}
                                           title="GitHub">
                                            <i className="fab fa-github"></i>
                                        </a>
                                        <a className="btn btn-outline-primary btn-sm rounded-circle d-flex align-items-center justify-content-center" 
                                           href={member.socialLinks.facebook}
                                           target="_blank"
                                           rel="noopener noreferrer"
                                           style={{ 
                                               width: "32px", 
                                               height: "32px", 
                                               fontSize: "12px",
                                               opacity: "1 !important",
                                               marginTop: "0 !important"
                                           }}
                                           title="Facebook">
                                            <i className="fab fa-facebook-f"></i>
                                        </a>
                                        <a className="btn btn-outline-primary btn-sm rounded-circle d-flex align-items-center justify-content-center" 
                                           href={member.socialLinks.instagram}
                                           target="_blank"
                                           rel="noopener noreferrer"
                                           style={{ 
                                               width: "32px", 
                                               height: "32px", 
                                               fontSize: "12px",
                                               opacity: "1 !important",
                                               marginTop: "0 !important"
                                           }}
                                           title="Instagram">
                                            <i className="fab fa-instagram"></i>
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

export default Team;
