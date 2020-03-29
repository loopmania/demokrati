<template>
    <div></div>
</template>

<script>
export default {
    created() {
        this.$store.dispatch('destroyToken')
            .then(() => {
                this.$router.push({ name: 'Actions'}) // TO-do: change to more valid homepage
            });
    }
}
</script>