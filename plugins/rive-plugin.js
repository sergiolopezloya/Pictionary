const {
  withAndroidManifest,
  withMainActivity,
  withAppBuildGradle,
  withSettingsGradle,
  withMainApplication,
  AndroidConfig,
} = require('@expo/config-plugins');

const withRive = config => {
  // Configure Android Build Gradle
  config = withAppBuildGradle(config, config => {
    const buildGradle = config.modResults.contents;

    // Add Rive dependency if not already present
    if (!buildGradle.includes('rive-react-native')) {
      const dependenciesIndex = buildGradle.indexOf('dependencies {');
      if (dependenciesIndex !== -1) {
        const insertIndex = buildGradle.indexOf('\n', dependenciesIndex) + 1;
        const riveImplementation = "    implementation project(':rive-react-native')\n";
        config.modResults.contents =
          buildGradle.slice(0, insertIndex) + riveImplementation + buildGradle.slice(insertIndex);
      }
    }

    return config;
  });

  // Configure Settings Gradle
  config = withSettingsGradle(config, config => {
    const settingsGradle = config.modResults.contents;

    // Add Rive module if not already present
    if (!settingsGradle.includes('rive-react-native')) {
      const includeAppIndex = settingsGradle.indexOf("include ':app'");
      if (includeAppIndex !== -1) {
        const insertIndex = settingsGradle.indexOf('\n', includeAppIndex) + 1;
        const riveIncludes = `include ':rive-react-native'\nproject(':rive-react-native').projectDir = new File(rootProject.projectDir, '../node_modules/rive-react-native/android')\n`;
        config.modResults.contents =
          settingsGradle.slice(0, insertIndex) + riveIncludes + settingsGradle.slice(insertIndex);
      }
    }

    return config;
  });

  // Configure MainApplication
  config = withMainApplication(config, config => {
    const mainApplication = config.modResults.contents;

    // Add Rive import if not already present
    if (!mainApplication.includes('RiveReactNativePackage')) {
      // Add import
      const importIndex = mainApplication.lastIndexOf('import');
      if (importIndex !== -1) {
        const insertIndex = mainApplication.indexOf('\n', importIndex) + 1;
        const riveImport = 'import app.rive.runtime.kotlin.RiveReactNativePackage\n';
        config.modResults.contents =
          mainApplication.slice(0, insertIndex) + riveImport + mainApplication.slice(insertIndex);
      }

      // Add package to getPackages()
      const packagesComment =
        '// Packages that cannot be autolinked yet can be added manually here';
      const packagesIndex = config.modResults.contents.indexOf(packagesComment);
      if (packagesIndex !== -1) {
        const insertIndex = config.modResults.contents.indexOf('\n', packagesIndex) + 1;
        const rivePackage = '            packages.add(RiveReactNativePackage())\n';
        config.modResults.contents =
          config.modResults.contents.slice(0, insertIndex) +
          rivePackage +
          config.modResults.contents.slice(insertIndex);
      }
    }

    return config;
  });

  return config;
};

module.exports = withRive;
