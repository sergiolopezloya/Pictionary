/**
 * PlayerInfo component for displaying player details and scores
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, ViewStyle, TextStyle } from 'react-native';
import { Player } from '../../types';
import { BaseComponentProps, Colors } from '../common/BaseComponent';

/**
 * Props interface for the PlayerInfo component
 */
export interface PlayerInfoProps extends BaseComponentProps {
  /** Array of players to display */
  players: Player[];
  /** ID of the current drawer */
  currentDrawerId?: string;
  /** Whether to show scores */
  showScores?: boolean;
  /** Whether to highlight the current drawer */
  highlightDrawer?: boolean;
  /** Custom container style */
  containerStyle?: ViewStyle;
  /** Custom player item style */
  playerItemStyle?: ViewStyle;
}

/**
 * Individual player item props
 */
interface PlayerItemProps {
  player: Player;
  isCurrentDrawer: boolean;
  showScore: boolean;
  highlightDrawer: boolean;
  style?: ViewStyle;
}

/**
 * Individual player item component
 *
 * @param props - PlayerItemProps
 * @returns JSX element for player item
 */
const PlayerItem: React.FC<PlayerItemProps> = ({
  player,
  isCurrentDrawer,
  showScore,
  highlightDrawer,
  style,
}) => {
  const itemStyles = StyleSheet.flatten(
    [
      styles.playerItem,
      isCurrentDrawer && highlightDrawer ? styles.currentDrawerItem : undefined,
      style,
    ].filter(Boolean)
  ) as ViewStyle;

  const nameStyles = StyleSheet.flatten(
    [
      styles.playerName,
      isCurrentDrawer && highlightDrawer ? styles.currentDrawerName : undefined,
    ].filter(Boolean)
  ) as TextStyle;

  const scoreStyles = StyleSheet.flatten(
    [
      styles.playerScore,
      isCurrentDrawer && highlightDrawer ? styles.currentDrawerScore : undefined,
    ].filter(Boolean)
  ) as TextStyle;

  return (
    <View style={itemStyles}>
      <View style={styles.playerHeader}>
        <Text style={nameStyles} numberOfLines={1}>
          {player.name}
        </Text>
        {isCurrentDrawer && (
          <View style={styles.drawerBadge}>
            <Text style={styles.drawerBadgeText}>Drawing</Text>
          </View>
        )}
      </View>

      {showScore && <Text style={scoreStyles}>{player.score} points</Text>}

      {isCurrentDrawer && <Text style={styles.drawerIndicator}>🎨 Currently drawing</Text>}
    </View>
  );
};

/**
 * PlayerInfo component that displays a list of players with their scores and status
 *
 * @example
 * ```tsx
 * <PlayerInfo
 *   players={gamePlayers}
 *   currentDrawerId={currentDrawer?.id}
 *   showScores={true}
 *   highlightDrawer={true}
 * />
 * ```
 */
export const PlayerInfo: React.FC<PlayerInfoProps> = ({
  players,
  currentDrawerId,
  showScores = true,
  highlightDrawer = true,
  containerStyle,
  playerItemStyle,
  style,
  testID,
}) => {
  /**
   * Renders a single player item
   * @param item - Player data and metadata
   * @returns JSX element for the player
   */
  const renderPlayerItem = ({ item }: { item: Player }) => (
    <PlayerItem
      player={item}
      isCurrentDrawer={item.id === currentDrawerId}
      showScore={showScores}
      highlightDrawer={highlightDrawer}
      {...(playerItemStyle && { style: playerItemStyle })}
    />
  );

  /**
   * Sorts players by score (descending) for leaderboard display
   * @param players - Array of players
   * @returns Sorted array of players
   */
  const getSortedPlayers = (players: Player[]): Player[] => {
    return [...players].sort((a, b) => b.score - a.score);
  };

  /**
   * Gets the key for each player item
   * @param item - Player object
   * @returns Unique key string
   */
  const getPlayerKey = (item: Player): string => item.id;

  const containerStyles = StyleSheet.flatten(
    [styles.container, containerStyle, style].filter(Boolean)
  ) as ViewStyle;

  const sortedPlayers = showScores ? getSortedPlayers(players) : players;

  return (
    <View style={containerStyles} testID={testID}>
      <Text style={styles.title}>{showScores ? 'Leaderboard' : 'Players'}</Text>

      <FlatList
        data={sortedPlayers}
        renderItem={renderPlayerItem}
        keyExtractor={getPlayerKey}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {showScores && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>Total Players: {players.length}</Text>
        </View>
      )}
    </View>
  );
};

/**
 * Styles for the PlayerInfo component
 */
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    margin: 8,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  } as TextStyle,

  listContainer: {
    flexGrow: 1,
  } as ViewStyle,

  playerItem: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
  } as ViewStyle,

  currentDrawerItem: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  } as ViewStyle,

  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  } as ViewStyle,

  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  } as TextStyle,

  currentDrawerName: {
    color: Colors.surface,
  } as TextStyle,

  playerScore: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  } as TextStyle,

  currentDrawerScore: {
    color: Colors.surface,
  } as TextStyle,

  drawerBadge: {
    backgroundColor: Colors.success,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  } as ViewStyle,

  drawerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.surface,
  } as TextStyle,

  drawerIndicator: {
    fontSize: 12,
    color: Colors.surface,
    fontStyle: 'italic',
    marginTop: 4,
  } as TextStyle,

  separator: {
    height: 8,
  } as ViewStyle,

  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    alignItems: 'center',
  } as ViewStyle,

  footerText: {
    fontSize: 14,
    color: Colors.text.tertiary,
  } as TextStyle,
});
