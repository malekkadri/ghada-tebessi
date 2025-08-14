const blogPosts = [
    {
        title: "How to build a website",
        category: "Web Design",
        image: "src/assets/styleTemplate/img/blog-1.jpg",
        author: "John Doe",
        date: "01 Jan, 2045",
        description: "Dolor et eos labore stet justo sed est sed sed sed dolor stet amet",
        link: "#"
    },
    {
        title: "10 Tips for UI/UX Design",
        category: "UI/UX",
        image: "src/assets/styleTemplate/img/blog-2.jpg",
        author: "Jane Smith",
        date: "05 Feb, 2045",
        description: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        link: "#"
    },
    {
        title: "SEO Best Practices in 2024",
        category: "SEO",
        image: "src/assets/styleTemplate/img/blog-3.jpg",
        author: "Michael Brown",
        date: "10 Mar, 2045",
        description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        link: "#"
    }
];

const Blog = () => {
    return (
        <div className="container-fluid py-5 wow fadeInUp" data-wow-delay="0.1s">
            <div className="container py-5">
                <div className="section-title text-center position-relative pb-3 mb-5 mx-auto" style={{ maxWidth: "600px" }}>
                    <h5 className="fw-bold text-primary text-uppercase">Latest Blog</h5>
                    <h1 className="mb-0">Read The Latest Articles from Our Blog</h1>
                </div>
                <div className="row g-5">
                    {blogPosts.map((post, index) => (
                        <div className="col-lg-4 wow slideInUp" data-wow-delay={`${0.3 + index * 0.3}s`} key={index}>
                            <div className="blog-item bg-light rounded overflow-hidden">
                                <div className="blog-img position-relative overflow-hidden">
                                    <img className="img-fluid" src={post.image} alt={post.title} />
                                    <a className="position-absolute top-0 start-0 bg-primary text-white rounded-end mt-5 py-2 px-4" href={post.link}>
                                        {post.category}
                                    </a>
                                </div>
                                <div className="p-4">
                                    <div className="d-flex mb-3">
                                        <small className="me-3"><i className="far fa-user text-primary me-2"></i>{post.author}</small>
                                        <small><i className="far fa-calendar-alt text-primary me-2"></i>{post.date}</small>
                                    </div>
                                    <h4 className="mb-3">{post.title}</h4>
                                    <p>{post.description}</p>
                                    <a className="text-uppercase" href={post.link}>Read More <i className="bi bi-arrow-right"></i></a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Blog;
