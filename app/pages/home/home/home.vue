<template>
    <layout-page>
        <div class="home-page">
            <div>
                <p class="home-title">
                    YOHO!BI报表工具
                </p>
                <router-link to="/design/project/list">
                    <i-button type="primary">进入工作台</i-button>
                </router-link>
            </div>
        </div>
    </layout-page>
</template>

<script>
export default {
  name: 'Home'
};
</script>

<style lang="scss">
.home-page {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  text-align: center;
  padding-top: 200px;

  .home-title {
    font-size: 50px;
    line-height: 120px;
  }
}
</style>
