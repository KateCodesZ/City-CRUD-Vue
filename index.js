/* global Vue */
Vue.createApp({
  data() {
    return {
      cities: [],
      newCity: {
        name: '',
        population: null
      },
      error: null
    };
  },

  created() {
    this.fetchCities();
  },

  methods: {
    // Loading the list of cities
    async fetchCities() {
      try {
        const response = await fetch('https://avancera.app/cities/');
        const data = await response.json();
        this.cities = data.map(city => ({
          ...city,
          isEditing: false
        }));
      } catch {
        this.error = 'Failed to load cities';
      }
    },

    async addCity() {
      if (!this.newCity.name || !this.newCity.population) {
        this.error = 'Please fill in all fields';
        return;
      }

      try {
        const response = await fetch('https://avancera.app/cities/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: this.newCity.name,
            population: Number(this.newCity.population)
          })
        });

        if (!response.ok) {
          throw new Error('Failed to add city');
        }

        // Reset form values
        this.newCity.name = '';
        this.newCity.population = null;

        // Update the list of cities
        await this.fetchCities();

        this.error = null;
      } catch {
        this.error = 'Failed to add city';
      }
    },

    // Updating a city
    async updateCity(city) {
      if (!city.id) {
        console.error('City ID is missing:', city);
        return;
      }

      try {
        const response = await fetch(`https://avancera.app/cities/${city.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: city.id,
            name: city.name,
            population: Number(city.population)
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }

        const index = this.cities.findIndex(c => c.id === city.id);
        if (index !== -1) {
          this.cities[index] = {
            ...this.cities[index],
            name: city.name,
            population: Number(city.population),
            isEditing: false
          };
        }
      } catch (error) {
        console.error('Error updating city:', error.message);
        this.error = 'Failed to update city';
      }
    },

    // Deleting a city
    async deleteCity(id) {
      try {
        const response = await fetch(`https://avancera.app/cities/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete city');
        }

        this.cities = this.cities.filter(city => city.id !== id);
        this.error = null;
      } catch {
        this.error = 'Failed to delete city';
      }
    }
  }
}).mount('#app');
