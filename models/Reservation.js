const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^[\+]?[0-9\s\-\(\)]+$/
    }
  },
  checkinDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      isAfter: new Date().toISOString().split('T')[0] // Nu poate fi în trecut
    }
  },
  checkoutDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      isAfterCheckin(value) {
        if (value <= this.checkinDate) {
          throw new Error('Data de checkout trebuie să fie după data de checkin');
        }
      }
    }
  },
  guests: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10
    },
    defaultValue: 1
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 1000]
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
    defaultValue: 'pending',
    allowNull: false
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  confirmationCode: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  specialRequests: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'reservations',
  indexes: [
    {
      fields: ['email']
    },
    {
      fields: ['checkinDate', 'checkoutDate']
    },
    {
      fields: ['status']
    },
    {
      fields: ['confirmationCode']
    }
  ],
  hooks: {
    beforeCreate: (reservation) => {
      // Generează cod de confirmare unic
      reservation.confirmationCode = 'CB' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
  }
});

module.exports = Reservation;