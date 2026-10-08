package com.projects.InventoryMangementSystem.Util;
public class TextSearch {

    private TextSearch() {
    }

    public static boolean isEmpty(String value) {
        return value == null || value.isBlank();
    }

    public static boolean matches(String fieldValue, String searchText) {

        if (isEmpty(searchText)) {
            return true;
        }

        if (fieldValue == null) {
            return false;
        }

        return fieldValue.toLowerCase().contains(searchText.trim().toLowerCase());
    }

    public static boolean matchesAny(String keyword, Object... fields) {

        if (isEmpty(keyword)) {
            return true;
        }

        String needle = keyword.trim().toLowerCase();

        for (Object field : fields) {
            if (field != null && field.toString().toLowerCase().contains(needle)) {
                return true;
            }
        }

        return false;
    }
}
