const CheckEmail = () => {
    return (
        <div className="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s">
            <div className="container py-5">
                <div className="row g-5">
                    <div className="col-lg-7">
                        <div className="section-title position-relative pb-3 mb-5">
                            <h1 className="mb-0 text-primary ">Password reset email sent</h1>
                        </div>
                        <p className="mb-4">
                        We've sent you a link to reset your password. The link expires in 6 hours.
                        <br/>
                        Didn't get an email? Check your junk folder or request another link here.
                        <br/>
                        You can close this window now.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckEmail;
