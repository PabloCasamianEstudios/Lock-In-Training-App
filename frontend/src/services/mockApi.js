const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  register: async (userData) => {
    console.log('Registering user:', userData);
    await delay(1500);

    const mockResponse = {
      id: 1,
      username: userData.username || 'ShadowPlayer',
      token: 'jwt_mock_token_' + Math.random().toString(36).substring(7),
      hasCompletedSurvey: false
    };

    localStorage.setItem('lockin_token', mockResponse.token);
    localStorage.setItem('lockin_user', JSON.stringify(mockResponse));

    return mockResponse;
  },

  login: async (credentials) => {
    console.log('Logging in user:', credentials);
    await delay(1000);

    const mockResponse = {
      id: 1,
      username: credentials.email.split('@')[0],
      token: 'jwt_mock_token_' + Math.random().toString(36).substring(7),
      hasCompletedSurvey: true
    };

    localStorage.setItem('lockin_token', mockResponse.token);
    return mockResponse;
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
