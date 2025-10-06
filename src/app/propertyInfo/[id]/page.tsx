import { getPropertyMetadata, PROPERTY_ADDRESSES } from "@/lib/contracts";

type PageProps = {
  params: { id: string };
};

export default function PropertyInfo({ params }: PageProps) {
  const { id } = params;
  
  // Get property address by ID (assuming ID is index into PROPERTY_ADDRESSES)
  const propertyIndex = parseInt(id) - 1;
  const propertyAddress = PROPERTY_ADDRESSES[propertyIndex] || PROPERTY_ADDRESSES[0];
  const metadata = getPropertyMetadata(propertyAddress);
  return (
    <div className="min-h-screen bg-beige-100">
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left side */}
      <div className="space-y-4">
        {/* Main image */}
        <img
          src={metadata.image}
          alt={`${metadata.name} Property`}
          className="w-full h-72 object-cover rounded-xl shadow"
        />

        {/* Thumbnails */}
        <div className="grid grid-cols-3 gap-2">
          {metadata.galleryImages.slice(0, 3).map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${metadata.name} Gallery ${index + 1}`}
              className="h-24 w-full object-cover rounded-md"
            />
          ))}
        </div>

        {/* Location + description */}
        <div className="space-y-3 ">
          <div className="flex items-center text-gray-600 text-sm font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 mr-1 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21c4.97-4.97 8-8.03 8-11.5A8 8 0 004 9.5C4 13 7.03 16.03 12 21z"
              />
              <circle cx="12" cy="9.5" r="2.5" />
            </svg>
            {metadata.location}
          </div>

          <p className="text-sm text-gray-700 leading-relaxed border border-gray-400 rounded rounded-md p-2 overflow-hidden">
            {metadata.description}
          </p>
          
          {/* Property Features */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-800">Key Features:</h3>
            <div className="flex flex-wrap gap-2">
              {metadata.features.map((feature, index) => (
                <span 
                  key={index}
                  className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-700 leading-relaxed border border-gray-400 rounded rounded-md p-2 overflow-hidden">
            The {metadata.name} project offers exceptional investment opportunities in Vietnam&apos;s growing real estate market. This premium development provides investors with stable returns through blockchain-based fractional ownership.
            mega-urban park of the investor Vingroup owns a prime location at
            Nguyen Xien & Phuoc Thien arterial streets of Long Thanh My ward –
            District 9 – Thu Duc City – Ho Chi Minh City. Along with hundreds of
            perfect utilities with a selling price of only 1.9 billion – 7.9
            billion/apartment, supporting 80% loan with principal grace and 0%
            interest rate, the project has been attracting thousands of
            first-time residents. private and live. The total area of ​​the
            super project is up to 271.8 hectares, providing the market with
            thousands of high-end apartments arranged in 71 high-rise apartment
            towers, with a total of more than 43,500 apartments + 1600 low-rise
            houses. floors of the type of townhouses and villas. Since the
            investor had information to launch the market, the Vinhome urban
            area in District 9 – Thu Duc has been highly appreciated, receiving
            the attention of a large number of customers as well as investors to
            find a new product. New products for settlement – stable profitable
            investment. With a large area but low construction density, most of
            the area of ​​the project is for green living landscape, utilities
            and services that meet the standard “ALL IN ONE – city in the heart
            of the city”.

          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {metadata.name.toUpperCase()}
          </h1>
          <span className="text-sm bg-green-100 text-green-600 font-semibold px-2 py-1 rounded">
            APY 5-7%
          </span>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded">
              Available
            </span>
            <span className="text-gray-600">500.000/1.000.000</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: "50%" }}
            ></div>
          </div>
        </div>

        {/* Price info */}
        <div className="flex gap-6 justify-between">
          <div>
            <p className="text-gray-500 text-sm">PROPERTY VALUE</p>
            <p className="text-lg font-bold text-black">$1.000</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">PRICE PER TOKEN</p>
            <p className="text-lg font-bold text-black">$0.01</p>
          </div>
        </div>

        {/* Buy input */}
        <div className="flex items-center border rounded-lg p-2 border border-gray-600">
          <input
            type="number"
            placeholder="1.000"
            className="flex-1 px-2 py-1 outline-none text-gray-800"
          />
          <span className="px-3 text-gray-600 font-semibold">VGP</span>
          <span className="px-3 text-gray-600">$100</span>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
            BUY NOW
          </button>
        </div>

        {/* Overview */}
        <div className="border rounded-xl p-4 space-y-4">
          <h2 className="font-semibold text-gray-800">Overview</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="border border-gray-400 rounded-md p-2">
              <p className="text-gray-500">Type</p>
              <p className="text-black font-medium">{metadata.type}</p>
            </div>
            <div className="border border-gray-400 rounded-md p-2">
              <p className="text-gray-500">Area</p>
              <p className="text-black font-medium">180</p>
            </div>
            <div className="border border-gray-400 rounded-md p-2">
              <p className="text-gray-500">Bedrooms</p>
              <p className="text-black font-medium">Residential Home</p>
            </div>
            <div className="border border-gray-400 rounded-md p-2">
              <p className="text-gray-500">Restrooms</p>
              <p className="text-black font-medium">Residential Home</p>
            </div>
            <div className="border border-gray-400 rounded-md p-2">
              <p className="text-gray-500">Parking</p>
              <p className="text-black font-medium">180</p>
            </div>
            <div className="border border-gray-400 rounded-md p-2">
              <p className="text-gray-500">Year built</p>
              <p className="text-black font-medium">Residential Home</p>
            </div>
          </div>
        </div>

        {/* Economics */}
        <div className="border rounded-xl p-4 space-y-4">
          <h2 className="font-semibold text-gray-800">Economics</h2>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="border border-gray-400 rounded-md p-2">
              <p className="text-gray-500">Model</p>
              <p className="text-black font-medium">Rental Income</p>
            </div>
            <div className="border border-gray-400 rounded-md p-2">
              <p className="text-gray-500">Income/ month</p>
              <p className="text-black font-medium">$1,200</p>
            </div>
            <div className="border border-gray-400 rounded-md p-2">
              <p className="text-gray-500">Holders</p>
              <p className="text-black font-medium">145</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
