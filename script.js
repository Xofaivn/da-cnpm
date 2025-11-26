const toggleBtn = document.getElementById("toggleSidebar");
const mainContainer = document.querySelector(".main_container");

toggleBtn.addEventListener("click", () => {
    mainContainer.classList.toggle("left-collapsed");

    const icon = toggleBtn.querySelector("i");
    if (icon) {
        if (mainContainer.classList.contains("left-collapsed")) {
            icon.classList.remove("fa-angle-left");
            icon.classList.add("fa-angle-right");
        } else {
            icon.classList.remove("fa-angle-right");
            icon.classList.add("fa-angle-left");
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const menuItems = document.querySelectorAll(".menu-item");

    const sections = {
        "home-page": document.querySelector(".home-page-container"),
        "personal-info": document.querySelector(".home-page-container"),
        "Leader-rules": document.querySelector(".Leader-rules-container"),
        "tournament-info": document.querySelector(".tournament-info-container"),
        "treatment": document.querySelector(".treatment-container"),
        "settings": document.querySelector(".setting-container")
    };

    const personalMenu = document.getElementById("personal-info-menu");
    const personalSection = document.getElementById("personal-info-details");

    function hideAllSections() {
        Object.values(sections).forEach(sec => {
            if (sec) sec.classList.add("hidden");
        });
        if (personalMenu) personalMenu.classList.add("hidden");
        if (personalSection) personalSection.classList.add("hidden");
    }

    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            hideAllSections();

            const key = Array.from(item.classList).find(cls => cls in sections);
            if (!key) return;

            const section = sections[key];
            if (!section) return;

            if (key === "personal-info") {
                // Hiện container + hiện personal info
                section.classList.remove("hidden");
                document.getElementById("home-page-details").classList.remove("hidden");
                document.getElementById("personal-info-details").classList.remove("hidden");
                document.getElementById("personal-info-menu").classList.remove("hidden");
            }
            else if (key === "home-page") {
                // Hiện container + hiện home details
                section.classList.remove("hidden");
                document.getElementById("home-page-details").classList.remove("hidden");
            }
            else {
                // Những mục khác
                section.classList.remove("hidden");
            }
        });
    });

});


document.addEventListener("DOMContentLoaded", () => {
    const treatmentContainer = document.querySelector(".treatment-container");
    const treatmentGallery = document.querySelector(".treatment-gallery");
    const imgs = document.querySelectorAll(".treatment-img");
    const zoomOverlay = document.querySelector(".treatment-zoom");
    const zoomedImg = document.querySelector(".zoomed-img");
    const closeZoom = document.querySelector(".close-zoom");

    // Nếu muốn show gallery khi click menu "treatment"
    const treatmentMenu = document.querySelector(".treatment");
    if (treatmentMenu) {
        treatmentMenu.addEventListener("click", () => {
            document.querySelectorAll("#home-page-details, #personal-info-details").forEach(sec => {
                sec.classList.add("hidden");
            });

            // Ẩn các container khác (Leader, tournament, setting)
            document.querySelectorAll(".Leader-rules-container, .tournament-info-container, .setting-container").forEach(sec => {
                sec.classList.add("hidden");
            });


            // Hiện gallery
            treatmentContainer.classList.remove("hidden");
            treatmentGallery.classList.remove("hidden");
        });
    }

    // Zoom ảnh
    imgs.forEach(img => {
        img.addEventListener("click", () => {
            zoomOverlay.classList.remove("hidden");
            zoomedImg.src = img.src;
        });
    });

    // Đóng overlay
    closeZoom.addEventListener("click", () => {
        zoomOverlay.classList.add("hidden");
        zoomedImg.src = "";
    });

    zoomOverlay.addEventListener("click", (e) => {
        if (e.target === zoomOverlay) {
            zoomOverlay.classList.add("hidden");
            zoomedImg.src = "";
        }
    });
});



// Setting container JS
document.addEventListener("DOMContentLoaded", () => {
    const languageSelect = document.getElementById("language-select");
    const backgroundSelect = document.getElementById("background-select");
    const changePasswordBtn = document.getElementById("change-password-btn");
    const deleteAccountBtn = document.getElementById("delete-account-btn");

    languageSelect.addEventListener("change", () => {
        console.log("Ngôn ngữ được chọn:", languageSelect.value);
        // Bạn có thể thêm logic đổi ngôn ngữ ở đây
    });

    backgroundSelect.addEventListener("change", () => {
        console.log("Hình nền được chọn:", backgroundSelect.value);
        // Bạn có thể thay đổi màu background body/main-container ở đây
    });
    const navbar = document.querySelector(".navbar");
    const bgSelect = document.getElementById("background-select");

    // Xử lý khi thay đổi lựa chọn
    bgSelect.addEventListener("change", (e) => {
        const value = e.target.value;
        if (value === "blue") {
            navbar.style.background = "#638cc5"; // màu xanh
        } else if (value === "gray") {
            navbar.style.background = "#7f7f7f"; // màu xám
        }
    });

    changePasswordBtn.addEventListener("click", () => {
        console.log("Đổi mật khẩu được click");
        // Logic đổi mật khẩu thực sự có thể thêm sau
    });

    deleteAccountBtn.addEventListener("click", () => {
        console.log("Xóa tài khoản được click");
        // Logic xóa tài khoản thực sự có thể thêm sau
    });
});
