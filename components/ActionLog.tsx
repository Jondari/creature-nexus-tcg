import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ActionLogEntry } from '../types/game';
import { t } from '../utils/i18n';

interface ActionLogProps {
  logs: ActionLogEntry[];
}

export function ActionLog({ logs }: ActionLogProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const formatActionDescription = (entry: ActionLogEntry): string => {
    const { action } = entry;
    
    switch (action.type) {
      case 'PLAY_CARD':
        return entry.description || `${t('actions.play')} card`;
      case 'ATTACK':
        return entry.description || `${t('actions.attack')} ${action.targetCardId ? 'creature' : 'directly'}`;
      case 'RETIRE_CARD':
        return entry.description || `${t('actions.retire')} card`;
      case 'END_TURN':
        return entry.description || t('actions.endTurn');
      default:
        return entry.description || 'Unknown action';
    }
  };

  const getActionIcon = (actionType: string, success: boolean): string => {
    if (!success) return '❌';
    
    switch (actionType) {
      case 'PLAY_CARD': return '🃏';
      case 'ATTACK': return '⚔️';
      case 'RETIRE_CARD': return '🔄';
      case 'END_TURN': return '⏭️';
      default: return '❓';
    }
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <View style={[styles.container, isCollapsed && styles.collapsed]}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setIsCollapsed(!isCollapsed)}
      >
        <Text style={styles.title}>Action Log</Text>
        <Text style={styles.toggleIcon}>{isCollapsed ? '▶' : '▼'}</Text>
      </TouchableOpacity>
      
      {!isCollapsed && (
        <ScrollView style={styles.logContainer} showsVerticalScrollIndicator={true}>
          {logs.length === 0 ? (
            <Text style={styles.emptyText}>No actions yet...</Text>
          ) : (
            logs.map((entry) => (
              <View key={entry.id} style={[styles.logEntry, !entry.success && styles.failedEntry]}>
                <View style={styles.logHeader}>
                  <Text style={styles.playerName}>
                    {getActionIcon(entry.action.type, entry.success)} {entry.playerName}
                  </Text>
                  <Text style={styles.timestamp}>{formatTime(entry.timestamp)}</Text>
                </View>
                <Text style={styles.actionDescription}>
                  {formatActionDescription(entry)}
                </Text>
                <Text style={styles.turnInfo}>Turn {entry.turn}</Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 300,
    backgroundColor: '#FFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: '80%',
  },
  collapsed: {
    maxHeight: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#4CAF50',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleIcon: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logContainer: {
    maxHeight: 400,
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  logEntry: {
    backgroundColor: '#F5F5F5',
    padding: 10,
    marginVertical: 2,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  failedEntry: {
    borderLeftColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  playerName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  timestamp: {
    fontSize: 10,
    color: '#666',
  },
  actionDescription: {
    fontSize: 11,
    color: '#444',
    marginBottom: 2,
  },
  turnInfo: {
    fontSize: 10,
    color: '#888',
    fontStyle: 'italic',
  },
});