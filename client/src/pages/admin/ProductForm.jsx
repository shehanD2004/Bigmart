import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useGetProductByIdQuery,
  useGetCategoriesQuery,
} from "../../features/api/adminApiSlice";
import {
  ChevronLeft,
  Save,
  X,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Plus,
  Info,
  Layout,
} from "lucide-react";

const ProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetCategoriesQuery();
  const {
    data: productData,
    isLoading: productLoading,
    isError: productError,
  } = useGetProductByIdQuery(id, { skip: !isEdit });

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    shortDescription: "",
    sellingType: "pack",
    unit: "pack",
    pricePerUnit: 0,
    compareAtPrice: 0,
    costPrice: 0,
    stock: 0,
    category: "",
    brand: "",
    isFeatured: false,
    isActive: true,
    weight: 0,
    lowStockThreshold: 10,
    images: [{ url: "", altText: "", isPrimary: true }],
  });

  const [errors, setErrors] = useState({});
  const [initialLoaded, setInitialLoaded] = useState(false);

  useEffect(() => {
    if (isEdit && productData?.data && !initialLoaded) {
      const p = productData.data;
      setFormData({
        name: p.name || "",
        sku: p.sku || "",
        description: p.description || "",
        shortDescription: p.shortDescription || "",
        sellingType: p.sellingType || "pack",
        unit: p.unit || "pack",
        pricePerUnit: p.pricePerUnit || 0,
        compareAtPrice: p.compareAtPrice || 0,
        costPrice: p.costPrice || 0,
        stock: p.stock || 0,
        category: p.category?._id || p.category || "",
        brand: p.brand?._id || p.brand || "",
        isFeatured: p.isFeatured || false,
        isActive: p.isActive !== undefined ? p.isActive : true,
        weight: p.weight || 0,
        lowStockThreshold: p.lowStockThreshold || 10,
        images:
          p.images?.length > 0
            ? p.images.map((img) => ({ ...img }))
            : [{ url: "", altText: "", isPrimary: true }],
      });
      setInitialLoaded(true);
    }
  }, [isEdit, productData, initialLoaded]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (index, value) => {
    const newImages = formData.images.map((img) => ({ ...img }));
    newImages[index].url = value;
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (formData.pricePerUnit <= 0) newErrors.pricePerUnit = "Price must be greater than 0";
    if (!formData.category) newErrors.category = "Category is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = { ...formData };
      if (payload.brand === "") payload.brand = null;

      if (isEdit) {
        await updateProduct({ id, ...payload }).unwrap();
      } else {
        await createProduct(payload).unwrap();
      }
      navigate("/admin/products");
    } catch (err) {
      console.error("Failed to save product:", err);
      setErrors({
        form: err.data?.message || "Something went wrong saving the product.",
      });
    }
  };

  if (isEdit && productLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-electric w-10 h-10" />
      </div>
    );
  }

  const categories = (categoriesData?.data || []).filter(
    (c) => c.type === "category",
  );
  const brands = (categoriesData?.data || []).filter((c) => c.type === "brand");

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-slate-900">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-sm text-slate-500">
            {isEdit
              ? `Modifying ${formData.name}`
              : "Create a new item in your catalog"}
          </p>
        </div>
      </div>

      {errors.form && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{errors.form}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-electric" /> General Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Product Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Item name (e.g., Rice, Milk)"
                  className={`w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all ${errors.name ? "border-rose-500" : "border-slate-200"}`}
                />
                {errors.name && (
                  <p className="text-xs text-rose-500 mt-1">{errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    SKU*
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="WNC-001"
                    className={`w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all uppercase ${errors.sku ? "border-rose-500" : "border-slate-200"}`}
                  />
                  {errors.sku && (
                    <p className="text-xs text-rose-500 mt-1">{errors.sku}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Selling Type
                  </label>
                  <select
                    name="sellingType"
                    value={formData.sellingType}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all"
                  >
                    <option value="pack">By Pack/Piece</option>
                    <option value="weight">By Weight</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Unit
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all"
                  >
                    {formData.sellingType === "weight" ? (
                      <>
                        <option value="kg">kg</option>
                        <option value="gram">gram</option>
                      </>
                    ) : (
                      <>
                        <option value="pack">pack</option>
                        <option value="piece">piece</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  placeholder="One sentence summary"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Detailed product information..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all"
                ></textarea>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-electric" /> Product Images
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center overflow-hidden">
                  {formData.images?.[0]?.url ? (
                    <img
                      src={formData.images[0].url}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Main Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.images[0]?.url || ""}
                    onChange={(e) => handleImageChange(0, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all text-sm"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Layout className="w-5 h-5 text-electric" /> Organization
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Category*
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all ${errors.category ? "border-rose-500" : "border-slate-200"}`}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-xs text-rose-500 mt-1">
                    {errors.category}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Brand
                </label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all"
                >
                  <option value="">Select Brand</option>
                  {brands.map((brand) => (
                    <option key={brand._id} value={brand._id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    name="lowStockThreshold"
                    value={formData.lowStockThreshold}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <input
                  type="checkbox"
                  id="isFeatured"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="w-4 h-4 text-electric focus:ring-electric border-slate-300 rounded"
                />
                <label
                  htmlFor="isFeatured"
                  className="text-sm font-semibold text-slate-700 cursor-pointer"
                >
                  Featured Product
                </label>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-electric focus:ring-electric border-slate-300 rounded"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-semibold text-slate-700 cursor-pointer"
                >
                  Available for Sale
                </label>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Pricing</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Price Per Unit (Rs.)*
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="pricePerUnit"
                  value={formData.pricePerUnit}
                  onChange={handleChange}
                  className={`w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all ${errors.pricePerUnit ? "border-rose-500" : "border-slate-200"}`}
                />
                {errors.pricePerUnit && (
                  <p className="text-xs text-rose-500 mt-1">{errors.pricePerUnit}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Compare at Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="compareAtPrice"
                  value={formData.compareAtPrice}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Cost Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all"
                />
              </div>
            </div>
          </section>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:Black transition-all flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5 hover=Blue style=red" /> Cancel 
            </button>
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="flex-[2] bg-electric hover:Black text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isCreating || isUpdating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isEdit ? "Update" : "Save"} Product
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
