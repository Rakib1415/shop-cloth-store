const {faker} = require('@faker-js/faker');
module.exports ={
   async generateProduct(ctx, next){
    try{
        const {id} = ctx.params;
        const product = await strapi.entityService.findOne("api::product.product",id, {
        populate : {
            attributes :{populate : "*"},
            attribute_options : {populate : "*"},
        }
    });

    if (!product || !id) {
        return ctx.send({ msg: "Bad Request!" });
      }

    const {attribute_options, attributes} = product;
    const variationShape = attributes.map((attr) => {
        return attribute_options
          .filter((option) => option.attribute.name === attr.name)
          .map((option) => option.name);
      });
    //   console.log(variationShape);
    const generateCombination = (arr) => {
        return arr.reduce(
          (acc, cur) => {
            return acc
              .map((x) => {
                return cur.map((y) => {
                  return x.concat([y]);
                });
              })
              .flat();
          },
          [[]]
        );
      };
      const variations = generateCombination(variationShape);

      const capitalize = (str) => {
        if (typeof str !== "string") return;

        return str
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      };
      
      const records = variations.map((variation) => {
        // ["Red", "256-gb-ram"]
        const title = variation.reduce(
          (acc, cur) => acc + " " + cur,
          product.title
        );

        const slug = variation.reduce(
          (acc, cur) => (acc + "-" + cur.replace(/ /g, "-")).toLowerCase(),
          product.slug
        );

        const imageUrl = faker.image.fashion(800, 800, true);

        return {
          title: capitalize(title),
          description: product.description,
          price: product.price,
          discountPrice: product.discountPrice ?? null,
          imageUrl,
          slug,
          product: product.id,
          stock: Math.floor(Math.random() * (100 - 20 + 1) + 20),
        };
      });
        // const createAllRecords = await Promise.all(
        //   records.map((record) => {
        //     return new Promise(async (resolve, reject) => {
        //       try {
        //         const created = await strapi.services[
        //           "api::variation.variation"
        //         ].create({
        //           data: record,
        //         });
        //         resolve(created);
        //       } catch (e) {
        //         reject(e);
        //       }
        //     });
        //   })
        // );

  await strapi.db.query("api::variation.variation").createMany({
    data : records
  });

    }catch(e){
        return ctx?.send({error : e});
    }
    },
    async generateRelatedProduct(ctx, next){
      const {id} = ctx.params;
      const productCount = await strapi.db.query("api::product.product").count();
      const productEntites = await strapi.entityService.findOne("api::product.product", id, {
        populate :{
          related_products : {populate : "*"},
          catalogs : {populate : "*"}
        }
      });
      const relatedProducts = productEntites?.catalogs[0]?.products?.filter(pd => pd.id !== parseInt(id));
      console.log(productCount);
      if(productCount > 0){
        await strapi.entityService.update("api::product.product", id, {
          data : {
            related_products : relatedProducts
          }
        });
      }
      
      return ctx.send({relatedProducts});
    }
}