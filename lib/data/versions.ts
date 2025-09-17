// Current data and model versions
export const CURRENT_DATA_VERSION = '2025-01';
export const CURRENT_MODEL_VERSION = '0.1.0';

export interface DataVersions {
  dataVersion: string;
  modelVersion: string;
  lastUpdated: string;
}

export const getCurrentVersions = (): DataVersions => ({
  dataVersion: CURRENT_DATA_VERSION,
  modelVersion: CURRENT_MODEL_VERSION,
  lastUpdated: '2025-01-01T00:00:00Z',
});

export const getDataPath = (filename: string, version?: string): string => {
  const dataVersion = version || CURRENT_DATA_VERSION;
  return `/data/v${dataVersion}/${filename}`;
};

export const getLifeTablePath = (version?: string): string => {
  return getDataPath('us_life_table.csv', version);
};

export const getCauseFractionsPath = (version?: string): string => {
  return getDataPath('cause_fractions.csv', version);
};

export const getHRPriorsPath = (version?: string): string => {
  return getDataPath('hr_priors.csv', version);
};

export const getZipCountyPath = (version?: string): string => {
  return getDataPath('zip_county_crosswalk.csv', version);
};

export const getGeoModifiersPath = (version?: string): string => {
  return getDataPath('geo_modifiers.csv', version);
};
