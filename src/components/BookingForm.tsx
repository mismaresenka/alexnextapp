// components/BookingForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler, useFieldArray, useWatch } from "react-hook-form";
import { IBooking, IBookedService } from "@/app/models/booking.model";
import { ICustomer } from "@/app/models/customer.model";
import { IService } from "@/app/models/services.model";

type FormInputs = {
  client: string;
  bookingDate: string;
  services: {
    serviceId: string;
    numberOfHours: number;
  }[];
};

const BookingForm = () => {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [services, setServices] = useState<IService[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { register, control, handleSubmit, formState: { errors }, reset } = useForm<FormInputs>({
    defaultValues: {
      client: "",
      bookingDate: "",
      services: [{ serviceId: "", numberOfHours: 1 }], // Start with one service row
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "services",
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customerRes, serviceRes] = await Promise.all([
          fetch("/api/customers"),
          fetch("/api/services"),
        ]);
        setCustomers(await customerRes.json());
        setServices(await serviceRes.json());
      } catch (err) {
        setError("Failed to load customers or services.");
      }
    };
    fetchData();
  }, []);
  
  const watchedServices = useWatch({ control, name: "services" });
  const serviceRateMap = new Map(services.map(s => [s._id, s.hourlyRate]));
  const total = watchedServices.reduce((acc, curr) => {
    const rate = serviceRateMap.get(curr.serviceId) || 0;
    return acc + (rate * (curr.numberOfHours || 0));
  }, 0);


  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || "Failed to create booking.");
      
      setSuccessMessage(`Booking created successfully! Total: ₱${responseData.totalAmount.toFixed(2)}`);
      reset(); // Reset form to default values
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md mt-10 dark:bg-gray-800">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-8 dark:text-white">
        Create New Booking
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="client" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Client</label>
            <select id="client" {...register("client", { required: "Client is required." })} className="form-select">
              <option value="">Select a client...</option>
              {customers.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>)}
            </select>
            {errors.client && <p className="error-message">{errors.client.message}</p>}
          </div>
          <div>
            <label htmlFor="bookingDate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Booking Date</label>
            <input type="date" id="bookingDate" {...register("bookingDate", { required: "Date is required." })} className="form-input" />
            {errors.bookingDate && <p className="error-message">{errors.bookingDate.message}</p>}
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2 dark:text-white">Services Rendered</h3>
        <div className="space-y-4 mb-4">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-6">
                <select {...register(`services.${index}.serviceId`, { required: true })} className="form-select">
                  <option value="">Select service...</option>
                  {services.map(s => <option key={s._id} value={s._id}>{s.serviceName}</option>)}
                </select>
              </div>
              <div className="col-span-4">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  {...register(`services.${index}.numberOfHours`, { required: true, valueAsNumber: true })}
                  className="form-input"
                  placeholder="Hours"
                />
              </div>
              <div className="col-span-2">
                <button type="button" onClick={() => remove(index)} className="w-full text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg text-sm px-4 py-2 text-center">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <button type="button" onClick={() => append({ serviceId: '', numberOfHours: 1 })} className="text-sm text-blue-600 hover:text-blue-800 mb-6">
          + Add Another Service
        </button>

        <div className="flex justify-between items-center border-t pt-4">
            <h3 className="text-xl font-bold dark:text-white">Total Due: <span className="text-blue-600">₱{total.toFixed(2)}</span></h3>
            <button type="submit" disabled={isSubmitting} className="w-48 text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50">
              {isSubmitting ? "Booking..." : "Create Booking"}
            </button>
        </div>

        {successMessage && <p className="mt-4 text-center text-sm text-green-600">{successMessage}</p>}
        {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
};


export default BookingForm;