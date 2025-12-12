const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");

const ensureUniqueSlug = async (base, tourId) => {
  let slug = base;
  let counter = 1;
  while (
    await prisma.tour.findFirst({
      where: {
        slug,
        NOT: { id: tourId },
      },
    })
  ) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
};

;(async () => {
  const tours = await prisma.tour.findMany();
  let updated = 0;

  for (const tour of tours) {
    const baseValue = tour.slug?.trim() || tour.title || tour.id;
    const baseSlug = slugify(baseValue);
    const slug = await ensureUniqueSlug(baseSlug, tour.id);
    if (tour.slug !== slug) {
      await prisma.tour.update({
        where: { id: tour.id },
        data: { slug },
      });
      updated += 1;
    }
  }

  console.log(`Updated ${updated} tour slugs.`);
  await prisma.$disconnect();
})();
