import { Link } from 'react-router-dom';

const Carousel = () => {
  return (
    <div id="header-carousel" className="carousel slide carousel-fade" data-bs-ride="carousel">
      <div className="carousel-inner">
        <div className="carousel-item active">
          <img className="w-100" src="src/assets/styleTemplate/img/carousel-1.jpg" alt="Carousel 1" />
          <div className="carousel-caption d-flex flex-column align-items-center justify-content-center">
            <div className="p-3" style={{ maxWidth: "900px" }}>
              <h5 className="text-white text-uppercase mb-3 animated slideInDown">Creative & Innovative</h5>
              <h1 className="display-1 text-white mb-md-4 animated zoomIn">Creative & Innovative Digital Solution</h1>
              <Link to="/sign-up" className="btn btn-primary rounded-pill px-5 py-3 me-3 position-relative overflow-hidden fw-bold animated slideInLeft">
                Sign Up
              </Link>
              <Link to="/sign-in" className="btn btn-outline-light rounded-pill px-5 py-3 position-relative overflow-hidden fw-bold animated slideInRight">
                Sign In
              </Link>
            </div>
          </div>
        </div>

        <div className="carousel-item">
          <img className="w-100" src="src/assets/styleTemplate/img/carousel-2.jpg" alt="Carousel 2" />
          <div className="carousel-caption d-flex flex-column align-items-center justify-content-center">
            <div className="p-3" style={{ maxWidth: "900px" }}>
              <h5 className="text-white text-uppercase mb-3 animated slideInDown">Creative & Innovative</h5>
              <h1 className="display-1 text-white mb-md-4 animated zoomIn">Creative & Innovative Digital Solution</h1>
              <Link to="/sign-up" className="btn btn-primary rounded-pill px-5 py-3 me-3 position-relative overflow-hidden fw-bold animated slideInLeft">
                Sign Up
              </Link>
              <Link to="/sign-in" className="btn btn-outline-light rounded-pill px-5 py-3 position-relative overflow-hidden fw-bold animated slideInRight">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      <button className="carousel-control-prev" type="button" data-bs-target="#header-carousel" data-bs-slide="prev">
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button className="carousel-control-next" type="button" data-bs-target="#header-carousel" data-bs-slide="next">
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
};

export default Carousel;