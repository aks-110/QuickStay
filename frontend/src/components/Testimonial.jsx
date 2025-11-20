import React from "react";
import Title from "./Title";
import { testimonials } from "../assets/assets";
import StarRating from "./StarRating";

const Testimonial = () => {
  return (
    <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 pt-20 pb-30">
      <Title
        title="What Our Guests Say"
        subtitle="Discover why discerning travelers consistently choose QuickStay for their exclusive and luxurious accommodations around the world."
      />

      <div className="flex flex-wrap justify-center gap-10 mt-20">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="bg-white w-full sm:w-[380px] p-7 rounded-2xl 
                       shadow-lg border border-gray-100 
                       hover:shadow-2xl hover:-translate-y-1 
                       transition-all duration-300 ease-out"
          >
            {/* Profile section */}
            <div className="flex items-center gap-4">
              <img
                className="w-14 h-14 rounded-full object-cover shadow-sm"
                src={testimonial.image}
                alt={testimonial.name}
              />
              <div>
                <p className="font-playfair text-xl font-semibold">{testimonial.name}</p>
                <p className="text-gray-500 text-sm">{testimonial.address}</p>
              </div>
            </div>

            {/* Star ratings */}
            <div className="flex items-center gap-1 mt-4">
              <StarRating />
            </div>

            {/* Review text */}
            <p className="text-gray-600 mt-4 leading-relaxed italic">
              "{testimonial.review}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonial;
