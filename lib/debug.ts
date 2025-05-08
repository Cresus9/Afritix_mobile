import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

// Debug utility to help track down crashes
export const debug = {
  // Log with timestamp and context
  log: (message: string, context?: any) => {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context, null, 2) : '';
    console.log(`[${timestamp}] ${message} ${contextStr}`);
    
    // Also write to file for persistent logs
    writeToLogFile(`[${timestamp}] ${message} ${contextStr}`);
  },
  
  // Log errors with stack trace
  error: (message: string, error: any) => {
    const timestamp = new Date().toISOString();
    const errorStr = error instanceof Error 
      ? `${error.message}\n${error.stack}` 
      : JSON.stringify(error, null, 2);
    
    console.error(`[${timestamp}] ERROR: ${message}\n${errorStr}`);
    
    // Write to file for persistent logs
    writeToLogFile(`[${timestamp}] ERROR: ${message}\n${errorStr}`);
  },
  
  // Get all logs
  getLogs: async () => {
    try {
      const logPath = `${FileSystem.documentDirectory}debug.log`;
      const fileInfo = await FileSystem.getInfoAsync(logPath);
      
      if (fileInfo.exists) {
        return await FileSystem.readAsStringAsync(logPath);
      }
      return 'No logs found';
    } catch (error) {
      console.error('Error reading logs:', error);
      return 'Error reading logs';
    }
  },
  
  // Clear logs
  clearLogs: async () => {
    try {
      const logPath = `${FileSystem.documentDirectory}debug.log`;
      await FileSystem.deleteAsync(logPath, { idempotent: true });
      return true;
    } catch (error) {
      console.error('Error clearing logs:', error);
      return false;
    }
  }
};

// Helper function to write to log file
async function writeToLogFile(message: string) {
  try {
    const logPath = `${FileSystem.documentDirectory}debug.log`;
    const fileInfo = await FileSystem.getInfoAsync(logPath);
    
    if (fileInfo.exists) {
      // Append to existing file
      await FileSystem.writeAsStringAsync(logPath, message + '\n', { encoding: FileSystem.EncodingType.UTF8, append: true });
    } else {
      // Create new file
      await FileSystem.writeAsStringAsync(logPath, message + '\n', { encoding: FileSystem.EncodingType.UTF8 });
    }
  } catch (error) {
    console.error('Error writing to log file:', error);
  }
}

// Export a singleton instance
export default debug; 