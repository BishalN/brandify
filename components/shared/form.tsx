import { useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import { CopyButton } from "../copy-button";
import { motion } from "framer-motion";
import { FADE_DOWN_ANIMATION_VARIANTS } from "@/lib/constants";
import LoadingDots from "./icons/loading-dots";

type Brand = {
  name: string;
  slogan: string;
};

export function Form() {
  const [title, setTitle] = useState("");
  const [style, setStyle] = useState("funny");
  const [brandIdentity, seBrandIdentity] = useState("");
  const [loading, setLoading] = useState(false);

  const generateBrandIdentity = async (e: any) => {
    e.preventDefault();
    seBrandIdentity("");
    // check if all fields are filled

    // check if the title is less than 3 characters long
    if (title.length < 3) {
      toast.error("Title must be at least 3 characters long");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/brandgen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        style,
      }),
    });

    if (!response.ok) {
      setLoading(false);
      toast.error("Something went wrong");
      return;
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      seBrandIdentity((prev) => prev + chunkValue);
    }

    setLoading(false);
  };

  const parsedBrand = useMemo(() => {
    let brandObj: Brand[] = [];
    const brands = brandIdentity
      .split("\n")
      .filter((brand) => brand !== "" && !!brand && brand.length > 0)
      .forEach((brand) => {
        const brandName = brand.split(":")[0].split(".")[1];
        const brandSlogan = brand.split(":")[1];
        brandObj.push({ name: brandName, slogan: brandSlogan });
      });
    return brandObj;
  }, [brandIdentity]);

  return (
    <motion.div
      variants={FADE_DOWN_ANIMATION_VARIANTS}
      className="my-10 max-w-2xl cursor-pointer space-y-8 divide-y divide-gray-200 rounded-lg  border-gray-200 bg-white py-4 px-8 shadow-md"
    >
      <form>
        <div className="space-y-8 divide-y divide-gray-200">
          <div className="pt-8">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Generate name and slogan for your brand
              </h3>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Usecase
                </label>
                <div className="mt-1">
                  <textarea
                    name="title"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Helping people find the best restaurants in their area"
                    autoComplete="title"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="sm:col-span-6">
                <label
                  htmlFor="style"
                  className="block text-sm font-medium text-gray-700"
                >
                  Personality
                </label>
                <div className="mt-1">
                  <select
                    name="style"
                    id="style"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                  >
                    <option value="neutral">Neutral</option>
                    <option value="cool">Cool</option>
                    <option value="serious">Serious</option>
                    <option value="expensive">Expensive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex ">
            <button
              type="button"
              onClick={generateBrandIdentity}
              disabled={loading}
              className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-gray-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              {loading ? (
                <span className="px-4">
                  <LoadingDots color="white" />
                </span>
              ) : (
                "Generate Brands"
              )}
            </button>
          </div>
        </div>
      </form>
      {brandIdentity ? (
        <div className="">
          <h3 className="my-6 text-lg font-medium leading-6 text-gray-900">
            Generated Brands
          </h3>
          {parsedBrand.map((brand, index) => (
            <div
              key={index}
              className="my-4  rounded-lg bg-gray-700 p-4 text-sm shadow-md"
            >
              <div className="flex justify-between">
                <p className="text-xl font-bold italic text-gray-200">
                  {brand.name}
                </p>
                <CopyButton value={`${brand.name} - ${brand.slogan}`} />
              </div>
              <p className="font-semibold italic text-gray-300">
                {brand.slogan}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}
