module.exports = {
    async afterCreate(event){
        const {result, params} = event;
        if(result?.attributes?.count > 0 && result?.attribute_options?.count > 0){
            await strapi.controllers["api::product.product-build"].generateProduct({
                params :{id : result.id}
            })
        } 
    }
}