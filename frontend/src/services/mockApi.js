const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export const authService = {
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        username: userData.username
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Error en el registro');
      throw new Error(errorText);
    }

    // El backend devuelve solo un mensaje, así que creamos
    // un "usuario" mínimo para el front.
    const registeredUser = {
      username: userData.username,
      email: userData.email,
      hasCompletedSurvey: false
    };

    localStorage.setItem('lockin_user', JSON.stringify(registeredUser));

    return registeredUser;
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Error de autenticación');
      throw new Error(errorText);
    }

    const data = await response.json(); // { token: '...' }

    const loggedUser = {
      username: credentials.email.split('@')[0],
      email: credentials.email,
      token: data.token,
      hasCompletedSurvey: true
    };

    localStorage.setItem('lockin_token', data.token);
    localStorage.setItem('lockin_user', JSON.stringify(loggedUser));

    return loggedUser;
  }
};

export const userService = {
  submitSurvey: async (surveyData) => {
    console.log('Submitting survey:', surveyData);
    await delay(2000);

    const pushUpsFactor = surveyData.pushUps === '50+' ? 20 : surveyData.pushUps === '30-50' ? 15 : 10;
    const runFactor = surveyData.runTime === '30min+' ? 20 : 15;

    const mockProfile = {
      id: 1,
      username: JSON.parse(localStorage.getItem('lockin_user'))?.username || 'JinWoo',
      rank: 'E',
      level: 1,
      stats: {
        STR: pushUpsFactor,
        AGI: runFactor,
        VIT: 10 + (parseInt(surveyData.weight) / 10),
        INT: 10,
        DEX: 10,
        LUK: 10,
        DISC: 5
      },
      biometria: {
        bmi: (parseFloat(surveyData.weight) / ((parseFloat(surveyData.height) / 100) ** 2)).toFixed(1),
        fatigue: 0,
        energy: 100
      }
    };

    localStorage.setItem('lockin_profile', JSON.stringify(mockProfile));

    const storedUser = JSON.parse(localStorage.getItem('lockin_user'));
    if (storedUser) {
      storedUser.hasCompletedSurvey = true;
      localStorage.setItem('lockin_user', JSON.stringify(storedUser));
    }

    return mockProfile;
  }
};
