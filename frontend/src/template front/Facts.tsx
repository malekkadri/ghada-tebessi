const Facts = () => {
  return (
    <>
      <div className="container-fluid facts py-5 pt-lg-0">
        <div className="container py-5 pt-lg-0">
          <div className="row gx-4">
            <div className="col-lg-4 wow zoomIn" data-wow-delay="0.1s">
              <div
                className="bg-primary shadow d-flex align-items-center justify-content-center p-4 position-relative overflow-hidden"
                style={{
                  height: "170px",
                  transform: "translateY(0)",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                {/* Logo en arrière-plan */}
                <div className="position-absolute top-0 end-0" style={{ opacity: "0.1" }}>
                  <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor" style={{ color: "white" }}>
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    <circle cx="18.5" cy="10.5" r="2.5"/>
                    <path d="M18.5 13c-1.67 0-5 .84-5 2.5V17h10v-1.5c0-1.66-3.33-2.5-5-2.5z"/>
                  </svg>
                </div>
                <div
                  className="bg-white d-flex align-items-center justify-content-center rounded mb-2"
                  style={{ width: "70px", height: "70px" }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--bs-primary)" }}>
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    <circle cx="18.5" cy="10.5" r="2.5"/>
                    <path d="M18.5 13c-1.67 0-5 .84-5 2.5V17h10v-1.5c0-1.66-3.33-2.5-5-2.5z"/>
                  </svg>
                </div>
                <div className="ps-4">
                  <h5 className="text-white mb-0">Active Users</h5>
                  <h1 className="text-white mb-0" data-toggle="counter-up">
                    5,432
                  </h1>
                  <small className="text-white" style={{ opacity: "0.8" }}>+12% this month</small>
                </div>
              </div>
            </div>
            <div className="col-lg-4 wow zoomIn" data-wow-delay="0.3s">
              <div
                className="bg-light shadow d-flex align-items-center justify-content-center p-4 position-relative overflow-hidden"
                style={{
                  height: "170px",
                  transform: "translateY(0)",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                {/* Logo en arrière-plan */}
                <div className="position-absolute top-0 end-0" style={{ opacity: "0.05" }}>
                  <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--bs-primary)" }}>
                    <path d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
                    <path d="M12 15l4-4H8l4 4z"/>
                  </svg>
                </div>
                <div
                  className="bg-primary d-flex align-items-center justify-content-center rounded mb-2"
                  style={{ width: "70px", height: "70px" }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style={{ color: "white" }}>
                    <path d="M20,8H4V6H20M20,18H4V12H20M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
                    <circle cx="12" cy="14" r="2"/>
                    <path d="M15,9H17V11H15V9Z"/>
                  </svg>
                </div>
                <div className="ps-4">
                  <h5 className="text-primary mb-0">vCards Created</h5>
                  <h1 className="mb-0" data-toggle="counter-up">
                    18,250
                  </h1>
                  <small className="text-muted">+8% this month</small>
                </div>
              </div>
            </div>
            <div className="col-lg-4 wow zoomIn" data-wow-delay="0.6s">
              <div
                className="bg-primary shadow d-flex align-items-center justify-content-center p-4 position-relative overflow-hidden"
                style={{
                  height: "170px",
                  transform: "translateY(0)",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                {/* Logo en arrière-plan */}
                <div className="position-absolute top-0 end-0" style={{ opacity: "0.1" }}>
                  <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor" style={{ color: "white" }}>
                    <path d="M12,2L13.09,8.26L22,9L17.36,13.74L18.18,22L12,19L5.82,22L6.64,13.74L2,9L10.91,8.26L12,2Z" />
                  </svg>
                </div>
                <div
                  className="bg-white d-flex align-items-center justify-content-center rounded mb-2"
                  style={{ width: "70px", height: "70px" }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--bs-primary)" }}>
                    <path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12zm4.64-1.96l3.54 3.54 7.07-7.07 1.41 1.41-8.48 8.48-4.95-4.95 1.41-1.41z"/>
                    <path d="M12 6c3.31 0 6 2.69 6 6 0 1.66-.67 3.16-1.76 4.24l-1.42-1.42C15.59 14.05 16 13.08 16 12c0-2.21-1.79-4-4-4s-4 1.79-4 4c0 1.08.41 2.05 1.18 2.82l-1.42 1.42C6.67 15.16 6 13.66 6 12c0-3.31 2.69-6 6-6z"/>
                  </svg>
                </div>
                <div className="ps-4">
                  <h5 className="text-white mb-0">API Calls</h5>
                  <h1 className="text-white mb-0" data-toggle="counter-up">
                    2.5M
                  </h1>
                  <small className="text-white" style={{ opacity: "0.8" }}>+25% this month</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Facts;
