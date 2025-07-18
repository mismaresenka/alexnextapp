import React from "react";
import CustomerForm from "../components/CustomerForm";
import ServiceForm from "../components/ServiceForm";
import BookingForm from "@/components/BookingForm";


const page = () => {
  return (
    <div className="">
      <CustomerForm />
      <ServiceForm />
      <BookingForm />
    </div>
  );
};

export default page;
