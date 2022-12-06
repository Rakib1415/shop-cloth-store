module.exports = {
    routes : [
        {
            method : "GET",
            path : "/products/:id/related-product",
            handler : "product-build.generateRelatedProduct"
        }
    ]
}