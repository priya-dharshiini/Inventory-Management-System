package com.projects.InventoryMangementSystem.Service;

import com.projects.InventoryMangementSystem.Entity.Product;
import com.projects.InventoryMangementSystem.Repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

import static com.projects.InventoryMangementSystem.Util.TextSearch.isEmpty;
import static com.projects.InventoryMangementSystem.Util.TextSearch.matches;
import static com.projects.InventoryMangementSystem.Util.TextSearch.matchesAny;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public Product createProduct(Product product) {

        validateProduct(product);

        if (productRepository.existsBySerialNumber(product.getSerialNumber())) {
            throw new RuntimeException("Serial number already exists");
        }

        if (isEmpty(product.getStatus())) {
            product.setStatus("AVAILABLE");
        }

        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    public Product updateProduct(Long id, Product updatedProduct) {

        Product product = getProductById(id);

        validateProduct(updatedProduct);

        if (isEmpty(updatedProduct.getStatus())) {
            throw new RuntimeException("Status is required");
        }

        product.setProductName(updatedProduct.getProductName());
        product.setProductType(updatedProduct.getProductType());
        product.setBrand(updatedProduct.getBrand());
        product.setModel(updatedProduct.getModel());
        product.setPurchaseDate(updatedProduct.getPurchaseDate());
        product.setPrice(updatedProduct.getPrice());
        product.setStatus(updatedProduct.getStatus());

        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }

    private void validateProduct(Product product) {

        if (isEmpty(product.getProductName())) {
            throw new RuntimeException("Product Name is required");
        }
        if (isEmpty(product.getProductType())) {
            throw new RuntimeException("Product Type is required");
        }
        if (isEmpty(product.getBrand())) {
            throw new RuntimeException("Brand is required");
        }
        if (isEmpty(product.getModel())) {
            throw new RuntimeException("Model is required");
        }
        if (isEmpty(product.getSerialNumber())) {
            throw new RuntimeException("Serial Number is required");
        }
        if (product.getPurchaseDate() == null) {
            throw new RuntimeException("Purchase Date is required");
        }
        if (product.getPrice() == null || product.getPrice() <= 0) {
            throw new RuntimeException("Price is required and must be greater than 0");
        }
    }

    public List<Product> searchProducts(
            String q, String id, String productName, String productType,
            String brand, String model, String serialNumber, String status,
            String purchaseDate, String price) {

        List<Product> result = new ArrayList<>();

        for (Product product : productRepository.findAll()) {

            if (!matches(String.valueOf(product.getId()), id)) continue;
            if (!matches(product.getProductName(), productName)) continue;
            if (!matches(product.getProductType(), productType)) continue;
            if (!matches(product.getBrand(), brand)) continue;
            if (!matches(product.getModel(), model)) continue;
            if (!matches(product.getSerialNumber(), serialNumber)) continue;
            if (!matches(product.getStatus(), status)) continue;
            if (!matches(product.getPurchaseDate() == null ? "" : product.getPurchaseDate().toString(), purchaseDate)) continue;
            if (!matches(product.getPrice() == null ? "" : String.valueOf(product.getPrice()), price)) continue;

            boolean keywordMatch = matchesAny(q,
                    product.getId(), product.getProductName(), product.getProductType(),
                    product.getBrand(), product.getModel(), product.getSerialNumber(),
                    product.getStatus(), product.getPurchaseDate(), product.getPrice());

            if (keywordMatch) {
                result.add(product);
            }
        }

        return result;
    }
}
