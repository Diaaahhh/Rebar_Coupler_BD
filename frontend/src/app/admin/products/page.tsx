"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/src/constants/api";
import type { Product } from "@/src/types/product";

const pageSizes = [5, 10, 25, 50];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let active = true;

    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products`, {
          cache: "no-store",
        });
        const data = (await response.json()) as { products: Product[] };

        if (active) {
          setProducts(data.products);
        }
      } catch {
        if (active) {
          setMessage("Could not load products.");
        }
      }
    };

    void fetchProducts();

    return () => {
      active = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) =>
      product.name.toLowerCase().includes(query)
    );
  }, [products, search]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + pageSize
  );

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Delete this product?");

    if (!confirmed) {
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (response.ok) {
      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== id)
      );
      setMessage("Product deleted.");
    } else {
      setMessage("Could not delete product.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="mt-2 text-gray-600">
            Search, edit, and delete saved products.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="rounded bg-[var(--primary)] px-5 py-3 text-center font-semibold text-white"
        >
          Add New Product
        </Link>
      </div>

      {message && (
        <div className="border border-gray-200 bg-white p-4 text-sm font-medium text-gray-700">
          {message}
        </div>
      )}

      <div className="border border-gray-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            Show
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setCurrentPage(1);
              }}
              className="rounded border border-gray-300 px-3 py-2 text-gray-900"
            >
              {pageSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            entries
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            Search:
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              className="w-64 max-w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-[var(--primary)]"
              placeholder="Search product name"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="border-b border-gray-200 p-4">SL</th>
                <th className="border-b border-gray-200 p-4">Image</th>
                <th className="border-b border-gray-200 p-4">Product Name</th>
                <th className="border-b border-gray-200 p-4">Created</th>
                <th className="border-b border-gray-200 p-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td className="p-5 text-center text-gray-600" colSpan={5}>
                    No products found.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product, index) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="border-b border-gray-100 p-4">
                      {startIndex + index + 1}
                    </td>
                    <td className="border-b border-gray-100 p-4">
                      <div className="h-16 w-24 border border-gray-200 bg-gray-50 p-1">
                        <img
                          src={
                            product.main_image_url ||
                            "/Anda-rebar-couplers.webp"
                          }
                          alt={product.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    </td>
                    <td className="border-b border-gray-100 p-4 font-semibold text-gray-900">
                      {product.name}
                    </td>
                    <td className="border-b border-gray-100 p-4 text-gray-600">
                      {new Date(product.created_at).toLocaleDateString()}
                    </td>
                    <td className="border-b border-gray-100 p-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/products/${product.slug}`}
                          className="rounded border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="rounded bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-white"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          className="rounded bg-red-600 px-3 py-2 text-xs font-semibold text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-gray-200 p-5 text-sm text-gray-600 md:flex-row md:items-center md:justify-between">
          <p>
            Showing{" "}
            {filteredProducts.length === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(startIndex + pageSize, filteredProducts.length)} of{" "}
            {filteredProducts.length} entries
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="rounded border border-gray-300 px-3 py-2 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="rounded bg-gray-100 px-3 py-2 font-semibold text-gray-900">
              {safePage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage === totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              className="rounded border border-gray-300 px-3 py-2 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
