import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils"
import { createProductCategoriesWorkflow, createProductsWorkflow, createShippingProfilesWorkflow } from "@medusajs/medusa/core-flows"

export default async function seedNrtDemo({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

  logger.info("Starting NRT demo seed...")

  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  })

  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null

  if (!shippingProfile) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: {
        data: [
          {
            name: "Default Shipping Profile",
            type: "default",
          },
        ],
      },
    })

    shippingProfile = result[0]
  }

  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name", "handle"],
    filters: {
      handle: "nrt",
    },
  })

  let nrtCategory = existingCategories?.[0]

  if (!nrtCategory) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: [
          {
            name: "NRT",
            is_active: true,
          },
        ],
      },
    })

    nrtCategory = result[0]
  }

  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle"],
    filters: {
      handle: ["nrt-nicotine-gum", "nrt-nicotine-patch"],
    },
  })

  const existingHandles = new Set((existingProducts || []).map((p: any) => p.handle))

  const products = [] as any[]

  if (!existingHandles.has("nrt-nicotine-gum")) {
    products.push({
      title: "Nicotine Gum",
      handle: "nrt-nicotine-gum",
      subtitle: "NRT chewing gum example",
      description: "Sample Medusa product for NRT gum. Flavor only applies to gum, while strength and strength class are variant options.",
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      category_ids: [nrtCategory.id],
      options: [
        {
          title: "Flavor",
          values: ["Mint", "Fruit"],
        },
        {
          title: "Strength Mg",
          values: ["2mg", "4mg"],
        },
        {
          title: "Strength Class",
          values: ["Mild", "Strong"],
        },
      ],
      variants: [
        {
          title: "Mint / 2mg / Mild",
          sku: "NRT-GUM-MINT-2MG",
          options: {
            Flavor: "Mint",
            "Strength Mg": "2mg",
            "Strength Class": "Mild",
          },
          prices: [
            { amount: 8.99, currency_code: "eur" },
            { amount: 9.99, currency_code: "usd" },
          ],
        },
        {
          title: "Fruit / 2mg / Mild",
          sku: "NRT-GUM-FRUIT-2MG",
          options: {
            Flavor: "Fruit",
            "Strength Mg": "2mg",
            "Strength Class": "Mild",
          },
          prices: [
            { amount: 8.99, currency_code: "eur" },
            { amount: 9.99, currency_code: "usd" },
          ],
        },
        {
          title: "Mint / 4mg / Strong",
          sku: "NRT-GUM-MINT-4MG",
          options: {
            Flavor: "Mint",
            "Strength Mg": "4mg",
            "Strength Class": "Strong",
          },
          prices: [
            { amount: 10.99, currency_code: "eur" },
            { amount: 11.99, currency_code: "usd" },
          ],
        },
        {
          title: "Fruit / 4mg / Strong",
          sku: "NRT-GUM-FRUIT-4MG",
          options: {
            Flavor: "Fruit",
            "Strength Mg": "4mg",
            "Strength Class": "Strong",
          },
          prices: [
            { amount: 10.99, currency_code: "eur" },
            { amount: 11.99, currency_code: "usd" },
          ],
        },
      ],
    })
  }

  if (!existingHandles.has("nrt-nicotine-patch")) {
    products.push({
      title: "Nicotine Patch",
      handle: "nrt-nicotine-patch",
      subtitle: "NRT transdermal patch example",
      description: "Sample Medusa product for NRT patch. Patch has strength and strength class, but no flavor option.",
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      category_ids: [nrtCategory.id],
      options: [
        {
          title: "Strength Mg",
          values: ["7mg", "14mg", "21mg"],
        },
        {
          title: "Strength Class",
          values: ["Mild", "Medium", "Strong"],
        },
      ],
      variants: [
        {
          title: "7mg / Mild",
          sku: "NRT-PATCH-7MG",
          options: {
            "Strength Mg": "7mg",
            "Strength Class": "Mild",
          },
          prices: [
            { amount: 14.99, currency_code: "eur" },
            { amount: 15.99, currency_code: "usd" },
          ],
        },
        {
          title: "14mg / Medium",
          sku: "NRT-PATCH-14MG",
          options: {
            "Strength Mg": "14mg",
            "Strength Class": "Medium",
          },
          prices: [
            { amount: 16.99, currency_code: "eur" },
            { amount: 17.99, currency_code: "usd" },
          ],
        },
        {
          title: "21mg / Strong",
          sku: "NRT-PATCH-21MG",
          options: {
            "Strength Mg": "21mg",
            "Strength Class": "Strong",
          },
          prices: [
            { amount: 18.99, currency_code: "eur" },
            { amount: 19.99, currency_code: "usd" },
          ],
        },
      ],
    })
  }

  if (products.length) {
    await createProductsWorkflow(container).run({
      input: {
        products,
      },
    })
    logger.info(`Created ${products.length} NRT demo products.`)
  } else {
    logger.info("NRT demo products already exist. Skipping product creation.")
  }

  logger.info(`NRT category id: ${nrtCategory.id}`)
  logger.info("Finished NRT demo seed.")
}
