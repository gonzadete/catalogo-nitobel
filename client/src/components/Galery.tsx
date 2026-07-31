const imageUrls = [
  "https://flowbite.s3.amazonaws.com/docs/gallery/square/image-1.jpg",
  "https://flowbite.s3.amazonaws.com/docs/gallery/square/image-2.jpg",
  "https://flowbite.s3.amazonaws.com/docs/gallery/square/image-3.jpg",
  "https://flowbite.s3.amazonaws.com/docs/gallery/square/image-4.jpg",
  "https://flowbite.s3.amazonaws.com/docs/gallery/square/image-5.jpg",
];

export default function Galery() {
  return (
    <section id="gallery" className="relative w-full">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {imageUrls.map((url, index) => (
          <img
            key={url}
            src={url}
            alt={`Galeria ${index + 1}`}
            className="h-56 w-full rounded-lg object-cover md:h-72"
            loading="lazy"
          />
        ))}
      </div>
    </section>
  );
}
