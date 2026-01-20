import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import axios from 'axios';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPackages = () => {
  const { getAuthHeaders } = useAuth();
  const { language, t } = useLanguage();
  const [halls, setHalls] = useState([]);
  const [selectedHall, setSelectedHall] = useState('');
  const [packages, setPackages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    package_type: 'thali',
    name: '',
    name_mr: '',
    rent: '',
    light_charges: '',
    description: '',
    description_mr: '',
    catalogue_url: '',
    catalogue_image: '',
    items: [],
    custom_fields: {
      rent_label: 'Rent',
      rent_label_mr: 'भाडे',
      light_label: 'Light Charges',
      light_label_mr: 'लाईट चार्जेस'
    }
  });

  useEffect(() => {
    fetchHalls();
  }, []);

  useEffect(() => {
    if (selectedHall) {
      fetchPackages();
    }
  }, [selectedHall]);

  const fetchHalls = async () => {
    try {
      const response = await axios.get(`${API}/halls`);
      setHalls(response.data);
      if (response.data.length > 0) {
        setSelectedHall(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching halls:', error);
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await axios.get(`${API}/packages?hall_id=${selectedHall}`);
      setPackages(response.data);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      package_type: 'thali',
      name: '',
      name_mr: '',
      rent: '',
      light_charges: '',
      description: '',
      description_mr: '',
      catalogue_url: '',
      items: []
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        hall_id: selectedHall,
        rent: formData.rent ? parseInt(formData.rent) : null,
        light_charges: formData.light_charges ? parseInt(formData.light_charges) : null
      };

      if (editingId) {
        await axios.put(`${API}/packages/${editingId}`, payload, getAuthHeaders());
        toast.success(t('Package updated!', 'पॅकेज अपडेट झाले!'));
      } else {
        await axios.post(`${API}/packages`, payload, getAuthHeaders());
        toast.success(t('Package added!', 'पॅकेज जोडले!'));
      }

      resetForm();
      fetchPackages();
    } catch (error) {
      toast.error(t('Error saving package', 'पॅकेज जतन करताना एरर'));
    }
  };

  const handleEdit = (pkg) => {
    setFormData({
      package_type: pkg.package_type,
      name: pkg.name,
      name_mr: pkg.name_mr,
      rent: pkg.rent || '',
      light_charges: pkg.light_charges || '',
      description: pkg.description || '',
      description_mr: pkg.description_mr || '',
      catalogue_url: pkg.catalogue_url || '',
      items: pkg.items || []
    });
    setEditingId(pkg.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('Delete this package?', 'हे पॅकेज डिलीट करायचे?'))) return;

    try {
      await axios.delete(`${API}/packages/${id}`, getAuthHeaders());
      toast.success(t('Package deleted!', 'पॅकेज डिलीट झाले!'));
      fetchPackages();
    } catch (error) {
      toast.error(t('Error deleting package', 'पॅकेज डिलीट करताना एरर'));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <label className="block text-sm font-semibold maroon-text mb-2">
              {t('Select Hall:', 'हॉल निवडा:')}
            </label>
            <select
              value={selectedHall}
              onChange={(e) => setSelectedHall(e.target.value)}
              className="px-4 py-2 border-2 border-[#D4AF37] rounded-lg focus:outline-none"
              data-testid="hall-select"
            >
              {halls.map((hall) => (
                <option key={hall.id} value={hall.id}>
                  {language === 'en' ? hall.name : hall.name_mr}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#800000] text-white rounded-full hover:bg-[#600000] transition-all"
            data-testid="add-package-btn"
          >
            <Plus size={20} />
            {t('Add Package', 'पॅकेज जोडा')}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-[#D4AF37]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="playfair text-xl font-bold maroon-text">
                {editingId ? t('Edit Package', 'पॅकेज संपादित करा') : t('Add New Package', 'नवीन पॅकेज जोडा')}
              </h3>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">{t('Package Type', 'पॅकेज प्रकार')}</label>
                <select
                  value={formData.package_type}
                  onChange={(e) => setFormData({ ...formData, package_type: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  data-testid="package-type-select"
                >
                  <option value="thali">{t('Thali System', 'थाळी सिस्टम')}</option>
                  <option value="normal">{t('Normal Rent', 'नॉर्मल भाडे')}</option>
                </select>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">{t('Package Name (English)', 'पॅकेज नाव (इंग्रजी)')}</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                    data-testid="package-name-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">{t('Package Name (Marathi)', 'पॅकेज नाव (मराठी)')}</label>
                  <input
                    type="text"
                    value={formData.name_mr}
                    onChange={(e) => setFormData({ ...formData, name_mr: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg marathi-text"
                    required
                    data-testid="package-name-mr-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">{t('Rent', 'भाडे')}</label>
                  <input
                    type="number"
                    value={formData.rent}
                    onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    data-testid="package-rent-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">{t('Light Charges', 'लाईट चार्जेस')}</label>
                  <input
                    type="number"
                    value={formData.light_charges}
                    onChange={(e) => setFormData({ ...formData, light_charges: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    data-testid="package-light-input"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">{t('Catalogue URL', 'कॅटलॉग URL')}</label>
                  <input
                    type="text"
                    value={formData.catalogue_url}
                    onChange={(e) => setFormData({ ...formData, catalogue_url: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    data-testid="package-catalogue-input"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-[#800000] text-white rounded-full hover:bg-[#600000]"
                data-testid="save-package-btn"
              >
                <Save size={20} />
                {t('Save', 'जतन करा')}
              </button>
            </form>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white p-6 rounded-xl shadow-md border-2 border-[#D4AF37]/30" data-testid={`package-${pkg.id}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="playfair text-xl font-bold maroon-text">
                  {language === 'en' ? pkg.name : pkg.name_mr}
                </h4>
                <span className="px-3 py-1 bg-[#D4AF37] text-white rounded-full text-sm">
                  {pkg.package_type === 'thali' ? t('Thali', 'थाळी') : t('Rent', 'भाडे')}
                </span>
              </div>
              {pkg.rent && <p className="text-gray-700">{t('Rent:', 'भाडे:')} ₹{pkg.rent.toLocaleString()}</p>}
              {pkg.light_charges && <p className="text-gray-700">{t('Light:', 'लाईट:')} ₹{pkg.light_charges.toLocaleString()}</p>}
              {pkg.catalogue_url && (
                <a href={pkg.catalogue_url} target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] text-sm">
                  {t('View Catalogue', 'कॅटलॉग पहा')}
                </a>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(pkg)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-[#D4AF37] text-[#800000] rounded-lg hover:bg-[#D4AF37] hover:text-white"
                  data-testid={`edit-package-${pkg.id}`}
                >
                  <Edit2 size={16} />
                  {t('Edit', 'संपादित')}
                </button>
                <button
                  onClick={() => handleDelete(pkg.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  data-testid={`delete-package-${pkg.id}`}
                >
                  <Trash2 size={16} />
                  {t('Delete', 'डिलीट')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {packages.length === 0 && !showAddForm && (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500">{t('No packages added yet.', 'अद्याप कोणतेही पॅकेजेस जोडले नाहीत.')}</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPackages;