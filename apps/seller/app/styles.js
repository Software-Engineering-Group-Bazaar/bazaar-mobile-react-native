import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
      //  justifyContent: 'center',
        backgroundColor: '#fff',
    },
    listContainer: {
      padding: 16,
    },
    storeCard: {
      backgroundColor: '#fff',
      borderRadius: 12,
      marginBottom: 16,
      overflow: 'hidden',
    },
    storeImage: {
      width: '100%',
      height: 200,
    },
    storeInfo: {
      padding: 16,
    },
    storeName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#4E8D7C',
      marginBottom: 4,
    },
    storeAddress: {
      fontSize: 14,
      color: '#6B7280',
    },
    scrollContent: {
      flexGrow: 1,
      backgroundColor: '#fff',
      paddingBottom: 40,
      paddingTop: 80, // Space for top buttons
    },
    topSpace: {
      height: 80, // Height adjusted for buttons
      justifyContent: 'center',
    },
    topButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
    },
    topRightButtons: {
      flexDirection: 'row',
      gap: 10,
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      color: '#4E8D7C',
      textAlign: 'center',
      marginTop: 15,
    },
    topButton: {
      backgroundColor: '#22C55E',
      padding: 8,
      borderRadius: 8,
    },
    topButtonText: {
      color: '#fff',
      fontSize: 14,
    },
    form: {
      padding: 16,
      marginTop: 20, // Space below top buttons
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: '#374151',
      marginBottom: 8,
    },
    languageButton: {
      position: 'absolute',
      top: 40,
      right: 20,
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#f1f5f9',
      zIndex: 1000,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
    },
    input: {
      backgroundColor: '#F3F4F6',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      fontSize: 16,
    },
    button: {
      backgroundColor: '#4E8D7C',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
      flexDirection: 'row',
      justifyContent: 'center',
      width: '100%',
    },
    buttonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
      marginLeft: 10,
    },
    row: {
      flexDirection: 'row',
      marginBottom: 16,
      gap: 12,
    },
    flex1: {
      flex: 1,
    },
    picker: {
      backgroundColor: '#F3F4F6',
      borderRadius: 8,
      width: "30%",
      height: '75%',
    },
    pickerFull: {
      backgroundColor: '#F3F4F6',
      borderRadius: 8,
      marginBottom: 16,
    },
    imageButton: {
      backgroundColor: '#4E8D7C',
      width: '93%',
      marginLeft: '3%',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 16,
    },
    imageButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    languageText: {
      fontSize: 10,
      fontWeight: '600',
      color: '#4E8D7C',
      marginTop: 2,
    },
    imagePreviewContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    imagePreview: {
      width: 100,
      height: 100,
      borderRadius: 8,
    },
    submitButton: {
      backgroundColor: '#4E8D7C',
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 16,
    },
    submitButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
    },
    titleSpacing: {
        marginTop: 20,
        marginBottom: 30
    },
    add_a_store_button: {
        width: '93%',
        height: '7%',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4E8D7C',
        marginBottom: 10,
        marginLeft: '3%'
    },
    socialButtonText: {
    fontSize: 16,
    marginLeft: 10,
    },
    createButton: {
      marginTop:30,
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#4E8D7C',
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 20,
      marginLeft: 16,
      marginBottom: 10,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 1.5,
    },
    createButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    image: {
      width: 220,
      height: 220,
      borderRadius: 10,
      marginBottom: 25,
    },
    placeholderImage: {
      width: 220,
      height: 220,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#ccc',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 25,
      backgroundColor: '#f0f0f0',
    },
    infoBox: {
      width: '100%',
      backgroundColor: '#f7f7f7',
      borderRadius: 8,
      padding: 15,
      marginBottom: 15,
      elevation: 2,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: '#333',
      marginTop: 5,
    },
    value: {
      fontSize: 16,
      color: '#4E8D7C',
      marginTop: 3,
    },
    section: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginTop: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 }, // povećano
      shadowOpacity: 0.12,
      shadowRadius: 5,
      elevation: 5, // Android sjena
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#1C1C1E',
      marginBottom: 12,
    },
  
    
  });
export default styles;