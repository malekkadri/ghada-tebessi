import { Link } from "react-router-dom";
import NexCardLogoFinal from '../atoms/Logo/NexCardLogoFinal';
import { useActiveSection } from '../hooks/useActiveSection';

const Header = () => {
  const activeSection = useActiveSection();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <div className="container-fluid position-relative p-0">
      <nav className="navbarfront navbarfront-expand-lg navbarfront-dark px-5 py-3 py-lg-0">
        <Link to="/" className="navbarfront-brand p-0">
          <div className="d-flex align-items-center">
            <NexCardLogoFinal size="lg" showText={true} />
          </div>
        </Link>
        <button
          className="navbarfront-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarfront"
        >
          <span className="fa fa-bars"></span>
        </button>
        <div className="navbarfront-collapse" id="navbarfront">
          <div className="navbarfront-nav ms-auto py-0">
            <a 
              href="#home" 
              className={`navbarfront-item navbarfront-link ${activeSection === 'home' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('home');
              }}
            >
              Home
            </a>
            <a 
              href="#about" 
              className={`navbarfront-item navbarfront-link ${activeSection === 'about' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('about');
              }}
            >
              About
            </a>
            <a 
              href="#services" 
              className={`navbarfront-item navbarfront-link ${activeSection === 'services' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('services');
              }}
            >
              Services
            </a>
            <a 
              href="#features" 
              className={`navbarfront-item navbarfront-link ${activeSection === 'features' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('features');
              }}
            >
              Features
            </a>
            <a 
              href="#pricing" 
              className={`navbarfront-item navbarfront-link ${activeSection === 'pricing' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('pricing');
              }}
            >
              Pricing
            </a>
            <a 
              href="#team" 
              className={`navbarfront-item navbarfront-link ${activeSection === 'team' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('team');
              }}
            >
              Team
            </a>
            <a 
              href="#testimonials" 
              className={`navbarfront-item navbarfront-link ${activeSection === 'testimonials' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('testimonials');
              }}
            >
              Testimonials
            </a>
            <a 
              href="#contact" 
              className={`navbarfront-item navbarfront-link mr-24 ${activeSection === 'contact' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('contact');
              }}
            >
              Contact
            </a>
          </div>
          <Link
            to="/sign-up"
            className="btn btn-primary rounded-pill px-5 py-2 position-relative overflow-hidden fw-bold ms-3 ml-4"
          >
            Sign Up
          </Link>
        </div>
      </nav>
    </div>
  );
}; 

export default Header;