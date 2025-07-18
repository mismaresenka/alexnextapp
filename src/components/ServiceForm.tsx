// components/ServiceForm.tsx
"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { IService, ServiceName } from "@/app/models/services.model"; // Adjust path if needed

type FormInputs = Omit<IService, "_id" | "createdAt" | "updatedAt">;

const availableServices: ServiceName[] = [
  "Plumbing",
  "Electrical",
  "Masonry",
  "Carpentry Works",
  "Others",
];

const ServiceForm = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormInputs>();

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Something went wrong");
      }

      if (response.status === 201) {
        setSuccessMessage(`${data.serviceName} was added successfully!`);
      } else if (response.status === 200) {
        setSuccessMessage(
          `${data.serviceName} hourly rate was updated successfully!`
        );
      }

      reset();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-8 bg-white rounded-lg shadow-md mt-10 dark:bg-gray-800">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-8 dark:text-white">
        Add New Service
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-6">
          <label
            htmlFor="serviceName"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Select a Service
          </label>
          <select
            id="serviceName"
            {...register("serviceName", {
              required: "Please select a service.",
            })}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="">Choose a service...</option>
            {availableServices.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
          {errors.serviceName && (
            <p className="mt-2 text-xs text-red-600">
              {errors.serviceName.message}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label
            htmlFor="hourlyRate"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Hourly Rate (₱)
          </label>
          <input
            id="hourlyRate"
            type="number"
            step="0.01" // Allows for cents
            {...register("hourlyRate", {
              required: "Hourly rate is required.",
              valueAsNumber: true,
              min: { value: 0, message: "Rate cannot be negative." },
            })}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="e.g., 75.50"
          />
          {errors.hourlyRate && (
            <p className="mt-2 text-xs text-red-600">
              {errors.hourlyRate.message}
            </p>
          )}
        </div>

        {successMessage && (
          <p className="mb-4 text-center text-sm text-green-600 dark:text-green-500">
            Service added successfully!
          </p>
        )}
        {error && (
          <p className="mb-4 text-center text-sm text-red-600 dark:text-red-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Adding..." : "Add Service"}
        </button>
      </form>
    </div>
  );
};

export default ServiceForm;
