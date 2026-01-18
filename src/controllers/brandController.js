import Brand from '../models/Brand.js';

// Create a new brand
export const createBrand = async (req, res) => {
    try {
        const { name } = req.body;
        const brand = new Brand({ name: name });
        await brand.save();
        res.status(201).json({ message: 'Brand created successfully', brand });
    } catch (error) {
        res.status(500).json({ message: 'Error creating brand', error: error.message });
    }
};

// Get all brands
export const getAllBrands = async (req, res) => {
    try {
        const brands = await Brand.find();
        res.status(200).json(brands);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching brands', error: error.message });
    }
};

// Get brand by ID
export const getBrandById = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) return res.status(404).json({ message: 'Brand not found' });
        res.status(200).json(brand);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching brand', error: error.message });
    }
};

// Update brand
export const updateBrand = async (req, res) => {
    try {
        const { name, description } = req.body;
        const brand = await Brand.findByIdAndUpdate(
            req.params.id,
            { name, description },
            { new: true, runValidators: true }
        );
        if (!brand) return res.status(404).json({ message: 'Brand not found' });
        res.status(200).json({ message: 'Brand updated successfully', brand });
    } catch (error) {
        res.status(500).json({ message: 'Error updating brand', error: error.message });
    }
};

// Delete brand
export const deleteBrand = async (req, res) => {
    try {
        const brand = await Brand.findByIdAndDelete(req.params.id);
        if (!brand) return res.status(404).json({ message: 'Brand not found' });
        res.status(200).json({ message: 'Brand deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting brand', error: error.message });
    }
};