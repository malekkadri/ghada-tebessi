import OwlCarousel from "react-owl-carousel";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";

const testimonials = [
  { 
    name: "Ahmed Benali", 
    profession: "Sales Director", 
    image: "src/assets/styleTemplate/img/testimonial-1.jpg", 
    text: "NexCard has transformed the way I network. My digital business cards are professional and I've increased my contacts by 40% in 3 months!" 
  },
  { 
    name: "Fatima El Mansouri", 
    profession: "Entrepreneur", 
    image: "src/assets/styleTemplate/img/testimonial-2.jpg", 
    text: "The project management and performance analytics are exceptional. I can track vCard engagement in real-time and optimize my strategy." 
  },
  { 
    name: "Youssef Talbi", 
    profession: "Digital Marketing Manager", 
    image: "src/assets/styleTemplate/img/testimonial-3.jpg", 
    text: "The API integration is seamless and the interface is intuitive. Our teams adopted the platform in just a few days. A real game-changer!" 
  },
  { 
    name: "Salma Ouali", 
    profession: "Business Consultant", 
    image: "src/assets/styleTemplate/img/testimonial-4.jpg", 
    text: "The authentication and security features are robust. I recommend NexCard to all professionals who want to modernize their networking." 
  },
  { 
    name: "Karim Zaidi", 
    profession: "IT Director", 
    image: "src/assets/styleTemplate/img/testimonial-1.jpg", 
    text: "The multi-platform compatibility is perfect. My cards automatically adapt to all devices. Responsive and professional customer support." 
  },
  { 
    name: "Nadia Benjelloun", 
    profession: "Business Coach", 
    image: "src/assets/styleTemplate/img/testimonial-2.jpg", 
    text: "The customizable templates and detailed statistics allowed me to optimize my digital presence. Visible ROI from the first month!" 
  }
];

const Testimonial = () => {
  return (
    <div className="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s">
      <div className="container py-5">
        <div className="section-title text-center position-relative pb-3 mb-5 mx-auto" style={{ maxWidth: "600px" }}>
          <h5 className="fw-bold text-primary text-uppercase position-relative">
            <span className="bg-light px-3 py-1 rounded-pill">Testimonials</span>
          </h5>
          <h1 className="mb-0 mt-2 position-relative">
            What Our Clients Say About 
            <span className="text-primary"> NexCard Platform</span>
          </h1>
          <div className="position-absolute bottom-0 start-50 translate-middle-x" 
               style={{ width: "80px", height: "3px", backgroundColor: "var(--bs-primary)" }}></div>
        </div>
        <OwlCarousel
          className="owl-theme"
          loop
          margin={20}
          nav
          autoplay
          smartSpeed={1500}
          dots={true}
          center
          responsive={{
            0: { items: 1 },
            576: { items: 1 },
            768: { items: 2 },
            992: { items: 3 },
          }}
        >
          {testimonials.map((testimonial, index) => (
            <div className="testimonial-item my-4" key={index}>
              <div className="service-item bg-light rounded-3 d-flex flex-column text-center p-4 h-100 position-relative overflow-hidden shadow-sm border"
                   style={{ 
                     transition: "all 0.3s ease-in-out",
                     transform: "translateY(0)",
                     background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                     minHeight: "300px"
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
                  <i className="fa fa-quote-right" style={{ fontSize: "3rem", color: "var(--bs-primary)" }}></i>
                </div>
                
                <div className="position-absolute top-0 start-0 m-3" style={{ opacity: "0.1" }}>
                  <i className="fa fa-quote-left" style={{ fontSize: "2rem", color: "var(--bs-primary)" }}></i>
                </div>
                
                <div className="mb-4 mt-3">
                  <div className="position-relative d-inline-block">
                    <img className="rounded-circle shadow border-3 border-white" 
                         src={testimonial.image} 
                         style={{ width: "80px", height: "80px", objectFit: "cover" }} 
                         alt={testimonial.name} />
                    <div className="position-absolute bottom-0 end-0 bg-primary rounded-circle d-flex align-items-center justify-content-center"
                         style={{ width: "25px", height: "25px" }}>
                      <i className="fa fa-check text-white" style={{ fontSize: "12px" }}></i>
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <h5 className="fw-bold text-primary mb-1">{testimonial.name}</h5>
                  <small className="text-muted text-uppercase fw-bold">{testimonial.profession}</small>
                </div>
                
                <div className="flex-grow-1 d-flex align-items-center">
                  <p className="text-muted lh-lg mb-0 fst-italic">
                    "{testimonial.text}"
                  </p>
                </div>
                
                <div className="mt-3">
                  <div className="d-flex justify-content-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i key={star} className="fa fa-star text-warning me-1" style={{ fontSize: "14px" }}></i>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </OwlCarousel>
      </div>
    </div>
  );
};

export default Testimonial;
